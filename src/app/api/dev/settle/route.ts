import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orders/store";
import { runGeneration } from "@/lib/agent/pipeline";
import { deliverOrder } from "@/lib/email/deliver";

export const maxDuration = 300;

/**
 * Dev-only payment bypass so the generation pipeline can be tested before
 * Paystack keys exist. Double-gated: refuses outside `next dev` and without
 * the explicit env flag. Never enable DEV_UNSAFE_SETTLE in production.
 */
export async function POST(request: NextRequest) {
  const isEnabled =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_UNSAFE_SETTLE === "1";
  if (!isEnabled) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ success: false, error: "orderId required." }, { status: 400 });
  }

  const order = await orderStore.get(orderId);
  if (!order) {
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }

  await orderStore.update(orderId, {
    status: "paid",
    payment: { reference: `dev-${orderId}`, amountKobo: 0, channel: "dev-bypass" },
  });
  await runGeneration(orderId);
  const delivered = await deliverOrder(orderId);

  return NextResponse.json({
    success: true,
    data: { status: delivered.status, agentLog: delivered.agentLog },
  });
}
