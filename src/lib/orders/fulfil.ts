import { orderStore } from "./store";
import { PACKAGES } from "./types";
import type { Order } from "./types";
import { verifyTransaction } from "../payments/paystack";
import { runGeneration } from "../agent/pipeline";
import { deliverOrder } from "../email/deliver";

/**
 * Verify a Paystack reference, mark the order paid, run the generation
 * pipeline, and deliver. Called by both the redirect callback and the
 * webhook — the `analyzed → paid` status transition makes it idempotent
 * (whichever arrives second sees a non-`analyzed` status and returns).
 */
export async function settlePayment(reference: string): Promise<Order | null> {
  const order = await orderStore.getByPaymentReference(reference);
  if (!order) return null;
  if (order.status !== "analyzed") return order; // already settled or in-flight

  const verified = await verifyTransaction(reference);
  const expected = PACKAGES[order.packageId].priceKobo;
  if (!verified.isSuccessful || verified.amountKobo < expected) {
    return order;
  }

  const paid = await orderStore.update(order.id, {
    status: "paid",
    payment: {
      ...order.payment,
      reference,
      amountKobo: verified.amountKobo,
      paidAt: verified.paidAt,
      channel: verified.channel,
    },
  });

  await runGeneration(paid.id);
  return deliverOrder(paid.id);
}

/**
 * Owner-confirmed bank transfer: mark paid and run the pipeline.
 * Only valid from awaiting_confirmation (set when the customer claimed
 * they sent the transfer).
 */
export async function confirmTransfer(orderId: string): Promise<Order> {
  const order = await orderStore.get(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);
  if (order.status !== "awaiting_confirmation") {
    throw new Error(`Order ${orderId} is not awaiting confirmation`);
  }

  const paid = await orderStore.update(order.id, {
    status: "paid",
    payment: {
      reference: order.payment?.reference ?? orderId,
      method: "transfer",
      amountKobo: PACKAGES[order.packageId].priceKobo,
      paidAt: new Date().toISOString(),
      channel: "bank_transfer",
      ...(order.payment?.transferClaimedAt
        ? { transferClaimedAt: order.payment.transferClaimedAt }
        : {}),
    },
  });

  await runGeneration(paid.id);
  return deliverOrder(paid.id);
}
