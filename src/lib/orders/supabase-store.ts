import crypto from "crypto";
import type { Order } from "./types";
import type { OrderStore } from "./store";

/**
 * Supabase Storage-backed order store for hosted deploys, where the
 * filesystem is ephemeral. Orders live as JSON objects in a private bucket
 * (`orders/<id>.json`), accessed server-side only with the service role key.
 * Selected automatically when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 */

const BUCKET = "sabicv-orders";
const REQUEST_TIMEOUT_MS = 15_000;

function config(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return { url: url.replace(/\/$/, ""), key };
}

function objectPath(id: string): string {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid order id");
  return `orders/${id}.json`;
}

async function storageFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const { url, key } = config();
  return fetch(`${url}/storage/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export class SupabaseOrderStore implements OrderStore {
  private async write(order: Order): Promise<void> {
    const res = await storageFetch(`object/${BUCKET}/${objectPath(order.id)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-upsert": "true",
        "cache-control": "no-cache",
      },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      throw new Error(`Order write failed (${res.status}): ${await res.text()}`);
    }
  }

  async create(
    data: Omit<Order, "id" | "createdAt" | "agentLog">,
  ): Promise<Order> {
    const order: Order = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      agentLog: [],
    };
    await this.write(order);
    return order;
  }

  async get(id: string): Promise<Order | null> {
    const res = await storageFetch(`object/${BUCKET}/${objectPath(id)}`);
    if (res.status === 400 || res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Order read failed (${res.status}): ${await res.text()}`);
    }
    return (await res.json()) as Order;
  }

  async getByPaymentReference(reference: string): Promise<Order | null> {
    const all = await this.list();
    return all.find((o) => o.payment?.reference === reference) ?? null;
  }

  async update(id: string, patch: Partial<Order>): Promise<Order> {
    const existing = await this.get(id);
    if (!existing) throw new Error(`Order not found: ${id}`);
    const next = { ...existing, ...patch };
    await this.write(next);
    return next;
  }

  async appendLog(
    id: string,
    entry: Order["agentLog"][number],
  ): Promise<void> {
    const existing = await this.get(id);
    if (!existing) throw new Error(`Order not found: ${id}`);
    await this.write({ ...existing, agentLog: [...existing.agentLog, entry] });
  }

  async list(): Promise<Order[]> {
    const res = await storageFetch(`object/list/${BUCKET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prefix: "orders",
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      }),
    });
    if (!res.ok) {
      throw new Error(`Order list failed (${res.status}): ${await res.text()}`);
    }
    const entries = (await res.json()) as Array<{ name: string }>;
    const ids = entries
      .map((e) => e.name)
      .filter((n) => n.endsWith(".json"))
      .map((n) => n.replace(/\.json$/, ""));
    const orders = await Promise.all(ids.map((id) => this.get(id)));
    return orders
      .filter((o): o is Order => o !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
