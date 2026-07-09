import type { PackageId } from "../orders/types";

/**
 * Selar merchant-of-record checkout: one Selar product link per package.
 * Links are public by nature, so they live in NEXT_PUBLIC_ env vars and the
 * client renders them directly. Matching a sale to an order is done by the
 * buyer's email + amount on the admin screen.
 */
export function getSelarLink(packageId: PackageId): string | null {
  const links: Record<PackageId, string | undefined> = {
    cv: process.env.NEXT_PUBLIC_SELAR_LINK_CV,
    cv_letter: process.env.NEXT_PUBLIC_SELAR_LINK_CV_LETTER,
    premium: process.env.NEXT_PUBLIC_SELAR_LINK_PREMIUM,
  };
  return links[packageId] ?? null;
}
