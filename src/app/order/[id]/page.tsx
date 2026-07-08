import Link from "next/link";
import { StatusView } from "./StatusView";

export const metadata = {
  title: "Your order — SabiCV",
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
          Your order
        </span>
      </header>
      <main className="py-10">
        <StatusView orderId={id} />
      </main>
    </div>
  );
}
