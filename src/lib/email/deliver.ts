import { orderStore } from "../orders/store";
import type { Order } from "../orders/types";

/**
 * Mark the order delivered and send the download email.
 * Email is env-gated (RESEND_API_KEY) so local dev works without it;
 * the status page always offers the downloads regardless.
 */
export async function deliverOrder(orderId: string): Promise<Order> {
  const order = await orderStore.get(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);

  const emailSent = await sendDeliveryEmail(order);

  await orderStore.appendLog(orderId, {
    at: new Date().toISOString(),
    step: "deliver",
    decision: emailSent
      ? `Documents delivered; download email sent to ${order.customer.email}.`
      : "Documents delivered via download page (email sending not configured).",
    durationMs: 0,
  });

  return orderStore.update(orderId, { status: "delivered" });
}

async function sendDeliveryEmail(order: Order): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!apiKey || !from || !baseUrl) return false;

  const link = `${baseUrl}/order/${order.id}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: order.customer.email,
      subject: "Your new CV is ready — SabiCV",
      text: [
        `Hello ${order.customer.name},`,
        "",
        "Your documents are ready. Download them here:",
        link,
        "",
        "Good luck with the application — go get shortlisted.",
        "— SabiCV",
      ].join("\n"),
    }),
  });
  return response.ok;
}
