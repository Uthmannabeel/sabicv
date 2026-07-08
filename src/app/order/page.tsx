import Link from "next/link";
import { OrderForm } from "./OrderForm";

export const metadata = {
  title: "Check your CV free — SabiCV",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] py-5">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-semibold"
        >
          SabiCV
        </Link>
        <span className="text-sm text-[color:var(--color-ink-faint)]">
          Free CV check
        </span>
      </header>
      <main className="py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl">
          Let&apos;s see how your CV scores.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
          Upload your CV and paste the job advert. The agent scores your match
          free — you only pay if you want the rewrite.
        </p>
        <OrderForm />
      </main>
    </div>
  );
}
