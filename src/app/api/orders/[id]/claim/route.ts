import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { orderStore } from "@/lib/orders/store";

/**
 * Customer claims they've completed payment on the external checkout
 * (Selar). Marks the order awaiting_confirmation for the owner. The owner
 * matches the sale by buyer email + amount before confirming.
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
  if (order.status === "awaiting_confirmation") {
    return NextResponse.json({ success: true, data: { status: order.status } });
  }
  if (order.status !== "analyzed") {
    return NextResponse.json(
      { success: false, error: "This order is not awaiting payment." },
      { status: 409 },
    );
  }

  const updated = await orderStore.update(id, {
    status: "awaiting_confirmation",
    payment: {
      reference: order.payment?.reference ?? `selar-${crypto.randomBytes(3).toString("hex")}`,
      method: "selar",
      amountKobo: 0,
      transferClaimedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true, data: { status: updated.status } });
}
