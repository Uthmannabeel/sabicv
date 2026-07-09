"use client";

import { useCallback, useEffect, useState } from "react";
import type { MatchAnalysis, OrderStatus } from "@/lib/orders/types";
import { TransferPanel } from "@/components/TransferPanel";
import { SelarPanel } from "@/components/SelarPanel";
import type { PackageId } from "@/lib/orders/types";

const PAYMENT_MODE = process.env.NEXT_PUBLIC_PAYMENT_MODE ?? "transfer";

interface OrderView {
  id: string;
  status: OrderStatus;
  packageId: string;
  packageIdTyped: PackageId;
  customerName: string;
  customerEmail: string;
  analysis: MatchAnalysis | null;
  hasCoverLetter: boolean;
  hasLinkedin: boolean;
  linkedin: { headline: string; about: string } | null;
  agentLog: { at: string; step: string; decision: string }[];
}

const POLL_INTERVAL_MS = 4000;
const ACTIVE_STATUSES: OrderStatus[] = [
  "awaiting_confirmation",
  "paid",
  "generating",
];

const STEP_LABELS: Record<string, string> = {
  extract: "Reading your CV",
  analyze: "Scoring against the job",
  rewrite: "Rewriting your CV",
  cover_letter: "Writing your cover letter",
  linkedin: "Optimising your LinkedIn",
  qa: "Integrity check",
  render: "Preparing PDFs",
  deliver: "Delivery",
};

export function StatusView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
      setOrder(body.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your order.");
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!order || !ACTIVE_STATUSES.includes(order.status)) return;
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [order, load]);

  async function handlePay() {
    const response = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
    const body = await response.json();
    if (body.success) window.location.href = body.data.authorizationUrl;
    else setError(body.error);
  }

  if (error && !order) {
    return <p className="text-[15px] text-[color:var(--color-danger)]">{error}</p>;
  }
  if (!order) {
    return <p className="text-[15px] text-[color:var(--color-ink-muted)]">Loading your order…</p>;
  }

  return (
    <div className="space-y-8">
      <Headline order={order} />
      {order.status === "analyzed" &&
        (PAYMENT_MODE === "selar" ? (
          <SelarPanel
            orderId={order.id}
            packageId={order.packageIdTyped}
            customerEmail={order.customerEmail}
            onClaimed={load}
          />
        ) : PAYMENT_MODE === "transfer" ? (
          <TransferPanel orderId={order.id} onClaimed={load} />
        ) : (
          <div className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] p-6">
            <p className="text-[15px] leading-relaxed">
              Your payment wasn&apos;t completed, so the rewrite hasn&apos;t
              started. Pick up where you left off:
            </p>
            <button
              onClick={handlePay}
              className="mt-4 bg-[color:var(--color-ink)] px-7 py-3.5 text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)]"
            >
              Complete payment
            </button>
          </div>
        ))}

      {order.status === "delivered" && <Downloads order={order} />}

      {order.agentLog.length > 0 && <AgentJournal log={order.agentLog} />}

      {error && <p className="text-sm text-[color:var(--color-danger)]">{error}</p>}
    </div>
  );
}

function Headline({ order }: { order: OrderView }) {
  const byStatus: Record<OrderStatus, { title: string; body: string }> = {
    created: {
      title: "Order received.",
      body: "We're scoring your CV — refresh in a moment.",
    },
    analyzed: {
      title: "Awaiting payment.",
      body: "Your free score is done. Complete payment to start the rewrite.",
    },
    awaiting_confirmation: {
      title: "Payment sent — we're confirming it.",
      body: "This usually takes minutes during the day. The moment it's confirmed, the agent starts writing and this page updates by itself.",
    },
    paid: {
      title: "Payment confirmed. The agent is on it.",
      body: "Your documents are being written now — this page updates by itself.",
    },
    generating: {
      title: "The agent is writing.",
      body: "Rewrite in progress — this page updates by itself. It usually takes a few minutes.",
    },
    delivered: {
      title: `Ready, ${order.customerName.split(" ")[0]}.`,
      body: "Your documents are below. A download link is also in your email.",
    },
    failed: {
      title: "Something went wrong on our side.",
      body: "Your payment is safe. We've been alerted — contact us on WhatsApp and we'll fix it or refund you same day.",
    },
  };
  const { title, body } = byStatus[order.status];
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
        {body}
      </p>
    </div>
  );
}

function Downloads({ order }: { order: OrderView }) {
  const items = [
    { label: "Your rewritten CV", href: `/api/orders/${order.id}/download?doc=cv` },
    ...(order.hasCoverLetter
      ? [{ label: "Your cover letter", href: `/api/orders/${order.id}/download?doc=letter` }]
      : []),
  ];
  return (
    <div className="border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)]">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="flex items-center justify-between border-b border-[color:var(--color-rule)] p-5 transition-colors duration-150 last:border-b-0 hover:bg-[color:var(--color-accent-wash)]"
        >
          <span className="text-[15px] font-medium">{item.label}</span>
          <span className="text-sm text-[color:var(--color-accent-strong)]">
            Download PDF
          </span>
        </a>
      ))}
      {order.linkedin && (
        <div className="border-t border-[color:var(--color-rule)] p-5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
            LinkedIn — copy and paste
          </p>
          <p className="mt-3 text-[15px] font-medium">{order.linkedin.headline}</p>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
            {order.linkedin.about}
          </p>
        </div>
      )}
    </div>
  );
}

function AgentJournal({ log }: { log: OrderView["agentLog"] }) {
  return (
    <section aria-label="Agent activity">
      <h2 className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
        The agent&apos;s journal
      </h2>
      <ol className="mt-4 space-y-4">
        {log.map((entry, i) => (
          <li
            key={i}
            className="border-l-2 border-[color:var(--color-accent)] pl-3"
          >
            <p className="text-[13px] font-medium text-[color:var(--color-accent-strong)]">
              {STEP_LABELS[entry.step] ?? entry.step}
              <span className="ml-2 font-normal text-[color:var(--color-ink-faint)]">
                {new Date(entry.at).toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <p className="mt-1 text-[14px] italic leading-snug text-[color:var(--color-ink-muted)]">
              {entry.decision}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
