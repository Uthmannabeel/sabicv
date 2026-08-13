import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Order } from "./types";
import { SupabaseOrderStore } from "./supabase-store";

/**
 * Order persistence. v1 ships a file-backed store so local dev and the demo
 * run with zero provisioning; the interface is the seam for the hosted
 * database implementation when we deploy (same shape, env-switched).
 */
export interface OrderStore {
  create(order: Omit<Order, "id" | "createdAt" | "agentLog">): Promise<Order>;
  get(id: string): Promise<Order | null>;
  getByPaymentReference(reference: string): Promise<Order | null>;
  update(id: string, patch: Partial<Order>): Promise<Order>;
  appendLog(id: string, entry: Order["agentLog"][number]): Promise<void>;
  list(): Promise<Order[]>;
}

const DATA_DIR = path.join(process.cwd(), "data", "orders");

async function readOrderFile(file: string): Promise<Order | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

class FileOrderStore implements OrderStore {
  private fileFor(id: string): string {
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid order id");
    return path.join(DATA_DIR, `${id}.json`);
  }

  private async write(order: Order): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const file = this.fileFor(order.id);
    const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(order, null, 2), "utf8");
    await fs.rename(tmp, file);
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
    return readOrderFile(this.fileFor(id));
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
    try {
      const files = await fs.readdir(DATA_DIR);
      const orders = await Promise.all(
        files
          .filter((f) => f.endsWith(".json"))
          .map((f) => readOrderFile(path.join(DATA_DIR, f))),
      );
      return orders
        .filter((o): o is Order => o !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
      return [];
    }
  }
}

const hasSupabase = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const orderStore: OrderStore = hasSupabase
  ? new SupabaseOrderStore()
  : new FileOrderStore();
