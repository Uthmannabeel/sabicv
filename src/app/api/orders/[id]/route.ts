import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orders/store";

export async function GET(
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

  // The order id is the bearer secret; return customer-facing fields only.
  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      status: order.status,
      packageId: order.packageId,
      customerName: order.customer.name,
      analysis: order.analysis ?? null,
      hasCoverLetter: Boolean(order.documents?.coverLetter),
      hasLinkedin: Boolean(order.documents?.linkedin),
      linkedin: order.documents?.linkedin ?? null,
      agentLog: order.agentLog.map(({ at, step, decision }) => ({
        at,
        step,
        decision,
      })),
    },
  });
}
