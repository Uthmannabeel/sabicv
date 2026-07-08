"use client";

import { useState } from "react";
import { PACKAGES, type PackageId, type MatchAnalysis } from "@/lib/orders/types";
import { ScoreCard } from "@/components/ScoreCard";

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG")}`;

type Phase =
  | { name: "form" }
  | { name: "analyzing" }
  | { name: "scored"; orderId: string; analysis: MatchAnalysis }
  | { name: "paying" };

const inputClass =
  "w-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] px-4 py-3 text-[15px] outline-none transition-colors duration-150 focus:border-[color:var(--color-accent)]";

export function OrderForm() {
  const [phase, setPhase] = useState<Phase>({ name: "form" });
  const [packageId, setPackageId] = useState<PackageId>("cv_letter");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    form.set("packageId", packageId);
    setPhase({ name: "analyzing" });

    try {
      const response = await fetch("/api/orders", { method: "POST", body: form });
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
      setPhase({
        name: "scored",
        orderId: body.data.orderId,
        analysis: body.data.analysis,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase({ name: "form" });
    }
  }

  async function handlePay(orderId: string) {
    setError(null);
    setPhase({ name: "paying" });
    try {
      const response = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
      const body = await response.json();
      if (!body.success) throw new Error(body.error);
      window.location.href = body.data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment couldn't start. Please try again.");
      setPhase({ name: "form" });
    }
  }

  if (phase.name === "analyzing" || phase.name === "paying") {
    return (
      <div className="mt-10 border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] p-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl">
          {phase.name === "analyzing"
            ? "The agent is reading your CV against the job…"
            : "Taking you to secure payment…"}
        </p>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
          {phase.name === "analyzing"
            ? "This usually takes under a minute. Don't close this page."
            : "Paystack will open in a moment."}
        </p>
        <div className="mx-auto mt-6 h-1 w-40 overflow-hidden bg-[color:var(--color-rule)]">
          <div className="h-full w-1/3 animate-[slide_1.2s_var(--ease-out-expo)_infinite] bg-[color:var(--color-accent)]" />
        </div>
        <style>{`@keyframes slide { from { transform: translateX(-100%);} to { transform: translateX(400%);} }`}</style>
      </div>
    );
  }

  if (phase.name === "scored") {
    const pkg = PACKAGES[packageId];
    return (
      <div className="mt-10">
        <ScoreCard analysis={phase.analysis} />
        <div className="mt-6 border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] p-6">
          <p className="text-[15px] leading-relaxed">
            Ready to fix it? The agent rewrites your CV for this exact job
            {pkg.id !== "cv" ? ", writes your cover letter," : ""} and delivers
            your documents in minutes.
          </p>
          <button
            onClick={() => handlePay(phase.orderId)}
            className="mt-5 w-full bg-[color:var(--color-ink)] px-7 py-4 text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)] sm:w-auto"
          >
            Pay {naira(pkg.priceKobo)} — get my {pkg.name}
          </button>
          <p className="mt-3 text-[13px] text-[color:var(--color-ink-faint)]">
            Card, transfer, or USSD via Paystack. Delivery link also goes to
            your email.
          </p>
        </div>
        {error && <p className="mt-4 text-sm text-[color:var(--color-danger)]">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-7">
      <fieldset>
        <legend className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
          What do you need
        </legend>
        <div className="mt-3 grid gap-px border border-[color:var(--color-rule)] bg-[color:var(--color-rule)] sm:grid-cols-3">
          {Object.values(PACKAGES).map((pkg) => (
            <label
              key={pkg.id}
              className={`cursor-pointer p-4 transition-colors duration-150 ${
                packageId === pkg.id
                  ? "bg-[color:var(--color-accent-wash)]"
                  : "bg-[color:var(--color-paper-raised)] hover:bg-[color:var(--color-paper)]"
              }`}
            >
              <input
                type="radio"
                name="package"
                value={pkg.id}
                checked={packageId === pkg.id}
                onChange={() => setPackageId(pkg.id as PackageId)}
                className="sr-only"
              />
              <span className="block text-[14px] font-medium">{pkg.name}</span>
              <span className="mt-1 block font-[family-name:var(--font-display)] text-xl">
                {naira(pkg.priceKobo)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="cv"
          className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
        >
          Your current CV
        </label>
        <label
          htmlFor="cv"
          className="mt-3 flex cursor-pointer items-center justify-between gap-3 border border-dashed border-[color:var(--color-ink-faint)] bg-[color:var(--color-paper-raised)] px-4 py-5 transition-colors duration-150 hover:border-[color:var(--color-accent)]"
        >
          <span className="text-[15px] text-[color:var(--color-ink-muted)]">
            {fileName ?? "Tap to upload — PDF or Word (.docx), max 5 MB"}
          </span>
          <span className="shrink-0 text-sm font-medium text-[color:var(--color-accent-strong)]">
            {fileName ? "Change" : "Browse"}
          </span>
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.docx"
          required
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
        >
          The job you want
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          required
          minLength={100}
          rows={8}
          placeholder="Paste the full job advert here — title, duties, requirements. The more you paste, the sharper your rewrite."
          className={`${inputClass} mt-3 resize-y`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
          >
            Your full name
          </label>
          <input id="name" name="name" required className={`${inputClass} mt-3`} />
        </div>
        <div>
          <label
            htmlFor="email"
            className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
          >
            Email (for delivery)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={`${inputClass} mt-3`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="whatsapp"
          className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
        >
          WhatsApp number (optional)
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          placeholder="For support only — we don't spam"
          className={`${inputClass} mt-3`}
        />
      </div>

      {error && <p className="text-sm text-[color:var(--color-danger)]">{error}</p>}

      <button
        type="submit"
        className="w-full bg-[color:var(--color-ink)] px-7 py-4 text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)] sm:w-auto"
      >
        Score my CV free
      </button>
    </form>
  );
}
