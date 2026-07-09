"use client";

import { useState } from "react";
import { PACKAGES, type PackageId } from "@/lib/orders/types";
import { getSelarLink } from "@/lib/payments/selar";

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG")}`;

export function SelarPanel({
  orderId,
  packageId,
  customerEmail,
  onClaimed,
}: {
  orderId: string;
  packageId: PackageId;
  customerEmail?: string;
  onClaimed: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasOpenedCheckout, setHasOpenedCheckout] = useState(false);

  const pkg = PACKAGES[packageId];
  const link = getSelarLink(packageId);

  if (!link) {
    return (
      <p className="text-sm text-[color:var(--color-danger)]">
        Payment isn&apos;t configured for this package yet. Please contact us
        on WhatsApp.
      </p>
    );
  }

  async function handleClaimed() {
    setIsClaiming(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/claim`, {
        method: "POST",
      });
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
      onClaimed();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setIsClaiming(false);
    }
  }

  return (
    <div className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] p-6">
      <p className="text-[15px] leading-relaxed">
        Pay <strong>{naira(pkg.priceKobo)}</strong> securely on Selar — card,
        bank transfer, or USSD. Use{" "}
        {customerEmail ? (
          <strong>{customerEmail}</strong>
        ) : (
          "the same email you entered here"
        )}{" "}
        at checkout so we can match your payment fast.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setHasOpenedCheckout(true)}
          className="bg-[color:var(--color-ink)] px-7 py-4 text-center text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)]"
        >
          Pay {naira(pkg.priceKobo)} on Selar
        </a>
        <button
          type="button"
          onClick={handleClaimed}
          disabled={isClaiming || !hasOpenedCheckout}
          className="border border-[color:var(--color-ink)] px-7 py-4 text-[15px] font-medium transition-colors duration-200 hover:bg-[color:var(--color-accent-wash)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isClaiming ? "One moment…" : "I have paid — check for it"}
        </button>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--color-ink-faint)]">
        Selar opens in a new tab. Once you&apos;ve paid, come back here and
        tap the second button — we confirm quickly during the day, and the
        agent starts writing the moment we do.
      </p>
      {error && <p className="mt-3 text-sm text-[color:var(--color-danger)]">{error}</p>}
    </div>
  );
}
