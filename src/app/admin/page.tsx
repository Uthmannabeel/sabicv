import { AdminView } from "./AdminView";

export const metadata = {
  title: "Orders — SabiCV admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8">
      <header className="flex items-baseline justify-between border-b border-[color:var(--color-rule)] py-5">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold">
          SabiCV
        </span>
        <span className="text-sm text-[color:var(--color-ink-faint)]">Orders</span>
      </header>
      <main className="py-8">
        <AdminView />
      </main>
    </div>
  );
}
