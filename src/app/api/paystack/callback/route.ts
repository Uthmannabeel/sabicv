import { NextRequest, NextResponse } from "next/server";
import { settlePayment } from "@/lib/orders/fulfil";

export const maxDuration = 300;

/**
 * Paystack redirects the customer here after checkout. Settlement is
 * idempotent with the webhook — whichever lands first does the work.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  try {
    const order = await settlePayment(reference);
    const target = order ? `/order/${order.id}` : "/";
    return NextResponse.redirect(new URL(target, request.nextUrl.origin));
  } catch (error) {
    console.error("Payment settlement failed:", error);
    // The order page shows the failed state and support contact.
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }
}
