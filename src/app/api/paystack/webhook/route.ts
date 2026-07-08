import { NextRequest, NextResponse } from "next/server";
import { isValidWebhookSignature } from "@/lib/payments/paystack";
import { settlePayment } from "@/lib/orders/fulfil";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ received: false }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: { reference: string };
  };

  if (event.event === "charge.success") {
    try {
      await settlePayment(event.data.reference);
    } catch (error) {
      // Log and still 200 — Paystack retries, and the callback path can settle.
      console.error("Webhook settlement failed:", error);
    }
  }

  return NextResponse.json({ received: true });
}
