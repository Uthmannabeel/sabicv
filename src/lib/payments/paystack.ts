import crypto from "crypto";
import { PACKAGES, type PackageId } from "../orders/types";

const PAYSTACK_BASE = "https://api.paystack.co";

class PaystackError extends Error {}

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new PaystackError("PAYSTACK_SECRET_KEY is not set");
  return key;
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await response.json()) as {
    status: boolean;
    message: string;
    data: T;
  };
  if (!response.ok || !body.status) {
    throw new PaystackError(`Paystack: ${body.message ?? response.statusText}`);
  }
  return body.data;
}

export interface InitializedTransaction {
  authorizationUrl: string;
  reference: string;
}

export async function initializeTransaction(params: {
  orderId: string;
  email: string;
  packageId: PackageId;
  callbackUrl: string;
}): Promise<InitializedTransaction> {
  const pkg = PACKAGES[params.packageId];
  const data = await paystackFetch<{
    authorization_url: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: pkg.priceKobo,
      currency: "NGN",
      callback_url: params.callbackUrl,
      metadata: { orderId: params.orderId, package: pkg.id },
    }),
  });
  return { authorizationUrl: data.authorization_url, reference: data.reference };
}

export interface VerifiedTransaction {
  isSuccessful: boolean;
  amountKobo: number;
  paidAt?: string;
  channel?: string;
}

export async function verifyTransaction(
  reference: string,
): Promise<VerifiedTransaction> {
  const data = await paystackFetch<{
    status: string;
    amount: number;
    paid_at?: string;
    channel?: string;
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
  return {
    isSuccessful: data.status === "success",
    amountKobo: data.amount,
    paidAt: data.paid_at,
    channel: data.channel,
  };
}

/** Validate the x-paystack-signature header on webhook calls. */
export function isValidWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");
  return (
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}
