import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orders/store";
import { PACKAGES } from "@/lib/orders/types";
import { isAuthorizedAdmin } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  const orders = await orderStore.list();
  return NextResponse.json({
    success: true,
    data: orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      packageName: PACKAGES[order.packageId].name,
      amountKobo: PACKAGES[order.packageId].priceKobo,
      customer: order.customer,
      matchScore: order.analysis?.matchScore ?? null,
      paymentMethod: order.payment?.method ?? null,
      transferCode:
        order.payment?.method === "transfer" ? order.payment.reference : null,
      transferClaimedAt: order.payment?.transferClaimedAt ?? null,
      paidAt: order.payment?.paidAt ?? null,
      error: order.error ?? null,
    })),
  });
}
