"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminOrder {
  id: string;
  createdAt: string;
  status: string;
  packageName: string;
  amountKobo: number;
  customer: { name: string; email: string; whatsapp?: string };
  matchScore: number | null;
  transferCode: string | null;
  transferClaimedAt: string | null;
  paidAt: string | null;
  error: string | null;
}

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG")}`;
const TOKEN_KEY = "sabicv-admin-token";
const POLL_INTERVAL_MS = 15_000;

const STATUS_LABELS: Record<string, string> = {
  created: "New",
  analyzed: "Scored, unpaid",
  awaiting_confirmation: "CHECK BANK — claims transfer sent",
  paid: "Paid",
  generating: "Agent writing",
  delivered: "Delivered",
  failed: "FAILED — needs attention",
};

export function AdminView() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
  }, []);

  const load = useCallback(async (authToken: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setOrders(null);
        setError("That key was rejected. Enter it again.");
        return;
      }
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
      setOrders(body.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load orders.");
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    load(token);
    const timer = setInterval(() => load(token), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [token, load]);

  async function handleConfirm(orderId: string) {
    if (!token) return;
    setConfirming(orderId);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setConfirming(null);
      load(token);
    }
  }

  if (!token) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = tokenInput.trim();
          if (!trimmed) return;
          localStorage.setItem(TOKEN_KEY, trimmed);
          setToken(trimmed);
        }}
        className="max-w-sm"
      >
        <label
          htmlFor="admin-token"
          className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
        >
          Admin key
        </label>
        <input
          id="admin-token"
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          className="mt-3 w-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] px-4 py-3 text-[15px] outline-none focus:border-[color:var(--color-accent)]"
        />
        <button
          type="submit"
          className="mt-4 bg-[color:var(--color-ink)] px-6 py-3 text-[15px] font-medium text-[color:var(--color-paper)]"
        >
          Open orders
        </button>
        {error && <p className="mt-3 text-sm text-[color:var(--color-danger)]">{error}</p>}
      </form>
    );
  }

  if (!orders) {
    return <p className="text-[15px] text-[color:var(--color-ink-muted)]">Loading orders…</p>;
  }

  const needsAction = orders.filter((o) => o.status === "awaiting_confirmation");
  const totalDelivered = orders.filter((o) => o.status === "delivered");
  const revenueKobo = totalDelivered.reduce((sum, o) => sum + o.amountKobo, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-[color:var(--color-rule)] pb-5">
        <p className="text-[15px]">
          <span className="font-[family-name:var(--font-display)] text-2xl">
            {needsAction.length}
          </span>{" "}
          <span className="text-[color:var(--color-ink-muted)]">to confirm</span>
        </p>
        <p className="text-[15px]">
          <span className="font-[family-name:var(--font-display)] text-2xl">
            {totalDelivered.length}
          </span>{" "}
          <span className="text-[color:var(--color-ink-muted)]">delivered</span>
        </p>
        <p className="text-[15px]">
          <span className="font-[family-name:var(--font-display)] text-2xl">
            {naira(revenueKobo)}
          </span>{" "}
          <span className="text-[color:var(--color-ink-muted)]">revenue</span>
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-[color:var(--color-danger)]">{error}</p>}

      <ul className="mt-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="border-b border-[color:var(--color-rule)] py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[15px] font-medium">
                {order.customer.name}
                <span className="ml-2 font-normal text-[color:var(--color-ink-muted)]">
                  {order.packageName} · {naira(order.amountKobo)}
                </span>
              </p>
              <p
                className={`text-[13px] font-medium ${
                  order.status === "awaiting_confirmation" || order.status === "failed"
                    ? "text-[color:var(--color-danger)]"
                    : "text-[color:var(--color-ink-faint)]"
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </p>
            </div>
            <p className="mt-1 text-[13px] text-[color:var(--color-ink-faint)]">
              {new Date(order.createdAt).toLocaleString("en-NG", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              {order.customer.email}
              {order.customer.whatsapp ? ` · ${order.customer.whatsapp}` : ""}
              {order.matchScore !== null ? ` · scored ${Math.round(order.matchScore)}/100` : ""}
            </p>
            {order.status === "awaiting_confirmation" && (
              <div className="mt-3 flex flex-wrap items-center gap-4 border-l-2 border-[color:var(--color-danger)] pl-3">
                <p className="text-[14px]">
                  Look for code{" "}
                  <span className="font-[family-name:var(--font-display)] text-lg">
                    {order.transferCode}
                  </span>{" "}
                  ({naira(order.amountKobo)}) in your bank app.
                </p>
                <button
                  onClick={() => handleConfirm(order.id)}
                  disabled={confirming === order.id}
                  className="bg-[color:var(--color-accent-strong)] px-5 py-2.5 text-[14px] font-medium text-[color:var(--color-paper)] disabled:opacity-60"
                >
                  {confirming === order.id ? "Confirming…" : "Money received — go"}
                </button>
              </div>
            )}
            {order.error && (
              <p className="mt-2 text-[13px] text-[color:var(--color-danger)]">{order.error}</p>
            )}
          </li>
        ))}
      </ul>
      {orders.length === 0 && (
        <p className="mt-6 text-[15px] text-[color:var(--color-ink-muted)]">
          No orders yet. They&apos;ll appear here the moment someone checks
          their CV.
        </p>
      )}
    </div>
  );
}
