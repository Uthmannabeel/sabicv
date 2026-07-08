import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orders/store";
import { initializeTransaction } from "@/lib/payments/paystack";

export async function POST(
  request: NextRequest,
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
  if (order.status !== "analyzed") {
    return NextResponse.json(
      { success: false, error: "This order is not awaiting payment." },
      { status: 409 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

  try {
    const tx = await initializeTransaction({
      orderId: order.id,
      email: order.customer.email,
      packageId: order.packageId,
      callbackUrl: `${baseUrl}/api/paystack/callback`,
    });

    await orderStore.update(order.id, {
      payment: { reference: tx.reference, amountKobo: 0 },
    });

    return NextResponse.json({
      success: true,
      data: { authorizationUrl: tx.authorizationUrl },
    });
  } catch (error) {
    console.error("Paystack initialization failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't start the payment. Please try again.",
      },
      { status: 502 },
    );
  }
}
