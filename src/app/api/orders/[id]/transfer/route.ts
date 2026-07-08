import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orders/store";
import { PACKAGES } from "@/lib/orders/types";
import { generateTransferCode, getBankDetails } from "@/lib/payments/transfer";

/**
 * Start a bank-transfer payment: issue the transfer code and bank details.
 * Idempotent — repeat calls return the same code.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await orderStore.get(id);
  if (!order) {
    return NextResponse.json(
      { success: false, error: "Order not found." },
      { status: 404 },
    );
  }
  if (order.status !== "analyzed" && order.status !== "awaiting_confirmation") {
    return NextResponse.json(
      { success: false, error: "This order is not awaiting payment." },
      { status: 409 },
    );
  }

  const code =
    order.payment?.method === "transfer" && order.payment.reference
      ? order.payment.reference
      : generateTransferCode();

  if (order.payment?.reference !== code) {
    await orderStore.update(id, {
      payment: { reference: code, method: "transfer", amountKobo: 0 },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      bank: getBankDetails(),
      transferCode: code,
      amountKobo: PACKAGES[order.packageId].priceKobo,
    },
  });
}

/** Customer taps "I have sent it" — flag for owner confirmation. */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await orderStore.get(id);
  if (!order) {
    return NextResponse.json(
      { success: false, error: "Order not found." },
      { status: 404 },
    );
  }
  if (order.status === "awaiting_confirmation") {
    return NextResponse.json({ success: true, data: { status: order.status } });
  }
  if (order.status !== "analyzed" || order.payment?.method !== "transfer") {
    return NextResponse.json(
      { success: false, error: "This order has no pending transfer." },
      { status: 409 },
    );
  }

  const updated = await orderStore.update(id, {
    status: "awaiting_confirmation",
    payment: {
      ...order.payment,
      transferClaimedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true, data: { status: updated.status } });
}
