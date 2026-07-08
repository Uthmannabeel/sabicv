"use client";

import { useCallback, useEffect, useState } from "react";

interface TransferDetails {
  bank: { bankName: string; accountNumber: string; accountName: string };
  transferCode: string;
  amountKobo: number;
}

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG")}`;

function CopyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-rule)] py-3 last:border-b-0">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
          {label}
        </p>
        <p
          className={
            strong
              ? "mt-0.5 font-[family-name:var(--font-display)] text-2xl tracking-wide"
              : "mt-0.5 text-[15px] font-medium"
          }
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 text-sm font-medium text-[color:var(--color-accent-strong)] underline-offset-4 hover:underline"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function TransferPanel({
  orderId,
  onClaimed,
}: {
  orderId: string;
  onClaimed: () => void;
}) {
  const [details, setDetails] = useState<TransferDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}/transfer`, { method: "POST" })
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return;
        if (!body.success) throw new Error(body.error);
        setDetails(body.data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load payment details."),
      );
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleClaimed() {
    setIsClaiming(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/transfer`, { method: "PUT" });
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
      onClaimed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsClaiming(false);
    }
  }

  if (error && !details) {
    return <p className="text-sm text-[color:var(--color-danger)]">{error}</p>;
  }
  if (!details) {
    return (
      <p className="text-[15px] text-[color:var(--color-ink-muted)]">
        Preparing your payment details…
      </p>
    );
  }

  return (
    <div className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] p-6">
      <p className="text-[15px] leading-relaxed">
        Transfer <strong>{naira(details.amountKobo)}</strong> to the account
        below, and put the payment code in the transfer description so we can
        find it fast.
      </p>

      <div className="mt-4">
        <CopyRow label="Bank" value={details.bank.bankName} />
        <CopyRow label="Account number" value={details.bank.accountNumber} />
        <CopyRow label="Account name" value={details.bank.accountName} />
        <CopyRow label="Amount" value={naira(details.amountKobo)} />
        <CopyRow label="Payment code (put in description)" value={details.transferCode} strong />
      </div>

      <button
        type="button"
        onClick={handleClaimed}
        disabled={isClaiming}
        className="mt-5 w-full bg-[color:var(--color-ink)] px-7 py-4 text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)] disabled:opacity-60 sm:w-auto"
      >
        {isClaiming ? "One moment…" : "I have sent the transfer"}
      </button>
      <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--color-ink-faint)]">
        We confirm transfers quickly during the day. The moment yours is
        confirmed, the agent starts writing — you&apos;ll see it live on your
        order page.
      </p>
      {error && <p className="mt-3 text-sm text-[color:var(--color-danger)]">{error}</p>}
    </div>
  );
}
