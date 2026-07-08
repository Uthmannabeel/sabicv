import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * Single-owner admin auth: a long random token in ADMIN_TOKEN, sent as a
 * bearer header from the admin page. In-code gate is the sole protection —
 * keep it strict (constant-time compare, no default token).
 */
export function isAuthorizedAdmin(request: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!provided) return false;

  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}
