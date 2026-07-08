import Link from "next/link";
import { PACKAGES } from "@/lib/orders/types";

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG")}`;

const STEPS = [
  {
    title: "Upload your CV and the job advert",
    body: "Your current CV as PDF or Word, plus the job description you're chasing. Two minutes on your phone.",
  },
  {
    title: "See your match score — free",
    body: "Our AI agent scores your CV against that exact job the way a recruiter's screening software would, and shows you what's holding you back. Before you pay anything.",
  },
  {
    title: "Get the version that competes",
    body: "Pay from ₦3,500 and the agent rewrites your CV for that job, writes your cover letter, and delivers clean PDFs in minutes — not days.",
  },
];

const PROMISES = [
  {
    title: "Score first, pay after",
    body: "You see your CV's honest match score and its biggest gaps before any payment. If you don't like what you see, walk away — it cost you nothing.",
  },
  {
    title: "Your real experience, never invented",
    body: "The agent restructures and sharpens what you've actually done. It is built to refuse to fabricate jobs, dates, or certificates — every draft passes an integrity check against your original CV.",
  },
  {
    title: "Built to pass the machines",
    body: "Single-column, keyword-aligned, ATS-safe formatting. Your CV gets read by software before any human — we write for both.",
  },
];

function AnnotatedSpecimen() {
  return (
    <figure
      aria-label="Example of SabiCV's editing"
      className="w-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper-raised)] p-5 shadow-[0_1px_0_var(--color-rule),0_12px_32px_-24px_rgb(0_0_0/0.35)] sm:p-6"
    >
      <figcaption className="mb-4 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
        What the agent does to one line
      </figcaption>
      <p className="font-[family-name:var(--font-display)] text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
        <span className="line-through decoration-[color:var(--color-danger)] decoration-2">
          Responsible for sales and marketing duties
        </span>
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-[17px] leading-relaxed">
        Grew monthly sales 40% in one year, managing 12 retail accounts across
        Lagos
      </p>
      <p className="mt-4 border-l-2 border-[color:var(--color-accent)] pl-3 text-[13px] italic leading-snug text-[color:var(--color-accent-strong)]">
        agent's note — your CV mentioned the 40% figure at the bottom; it
        belongs in the first line the recruiter reads.
      </p>
    </figure>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] py-5">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold">
          SabiCV
        </span>
        <Link
          href="/order"
          className="text-sm font-medium text-[color:var(--color-accent-strong)] underline-offset-4 hover:underline"
        >
          Check my CV free
        </Link>
      </header>

      <main>
        <section className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[2.6rem] font-medium leading-[1.06] tracking-tight sm:text-6xl">
              The CV that gets you shortlisted.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[color:var(--color-ink-muted)]">
              Upload your CV, paste the job you want. Our AI career agent
              scores your match free — then rewrites your CV and cover letter
              for that exact job in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/order"
                className="bg-[color:var(--color-ink)] px-7 py-3.5 text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)]"
              >
                Check my CV free
              </Link>
              <span className="text-sm text-[color:var(--color-ink-faint)]">
                No account. No card needed to see your score.
              </span>
            </div>
          </div>
          <AnnotatedSpecimen />
        </section>

        <section
          aria-labelledby="how-heading"
          className="border-t border-[color:var(--color-rule)] py-14"
        >
          <h2
            id="how-heading"
            className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
          >
            How it works
          </h2>
          <ol className="mt-8 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--color-accent)]">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="pricing-heading"
          className="border-t border-[color:var(--color-rule)] py-14"
        >
          <h2
            id="pricing-heading"
            className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
          >
            Straight pricing
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden border border-[color:var(--color-rule)] bg-[color:var(--color-rule)] sm:grid-cols-3">
            {Object.values(PACKAGES).map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col bg-[color:var(--color-paper-raised)] p-6"
              >
                <h3 className="text-[15px] font-medium">{pkg.name}</h3>
                <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">
                  {naira(pkg.priceKobo)}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-[14px] leading-snug text-[color:var(--color-ink-muted)]">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-[color:var(--color-accent)]">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[color:var(--color-ink-faint)]">
            Pay with card, transfer, or USSD via Paystack. One-time payment per
            application — no subscription.
          </p>
        </section>

        <section
          aria-labelledby="promise-heading"
          className="border-t border-[color:var(--color-rule)] py-14"
        >
          <h2
            id="promise-heading"
            className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]"
          >
            Why trust it
          </h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {PROMISES.map((promise) => (
              <div key={promise.title}>
                <h3 className="font-[family-name:var(--font-display)] text-xl leading-snug">
                  {promise.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
                  {promise.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[color:var(--color-rule)] py-16 text-center">
          <h2 className="mx-auto max-w-lg font-[family-name:var(--font-display)] text-3xl leading-snug sm:text-4xl">
            Your next application deserves better than your old CV.
          </h2>
          <Link
            href="/order"
            className="mt-8 inline-block bg-[color:var(--color-ink)] px-8 py-4 text-[15px] font-medium text-[color:var(--color-paper)] transition-colors duration-200 hover:bg-[color:var(--color-accent-strong)]"
          >
            Check my CV free
          </Link>
        </section>
      </main>

      <footer className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[color:var(--color-rule)] py-6 text-[13px] text-[color:var(--color-ink-faint)]">
        <span>SabiCV — an AI-operated career service.</span>
        <span>Powered by Google Gemini.</span>
      </footer>
    </div>
  );
}
