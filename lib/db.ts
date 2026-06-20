import { sql } from "@vercel/postgres";

/**
 * Data is stored in a single key/value table (`app_kv`), one row per collection.
 * This keeps the schema trivial and lets the app evolve without migrations,
 * while still being backed by a real Postgres database on Vercel.
 */

export interface Collections {
  categories: any[];
  products: any[];
  salesmen: any[];
  deliverymen: any[];
  orders: any[];
  qr: any;
  admin: any;
}

const DEFAULTS: Record<string, any> = {
  categories: [],
  products: [],
  salesmen: [],
  deliverymen: [],
  orders: [],
  qr: { image: "", upiName: "", status: "Inactive" },
  admin: { password: "admin123" },
};

let schemaReady = false;

export async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS app_kv (key text PRIMARY KEY, value jsonb NOT NULL)`;
  for (const [key, val] of Object.entries(DEFAULTS)) {
    await sql`INSERT INTO app_kv (key, value)
              VALUES (${key}, ${JSON.stringify(val)}::jsonb)
              ON CONFLICT (key) DO NOTHING`;
  }
  schemaReady = true;
}

async function ready() {
  if (!schemaReady) await ensureSchema();
}

export async function readAll(): Promise<Collections> {
  await ready();
  const { rows } = await sql`SELECT key, value FROM app_kv`;
  const map: Record<string, any> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    categories: map.categories ?? [],
    products: map.products ?? [],
    salesmen: map.salesmen ?? [],
    deliverymen: map.deliverymen ?? [],
    orders: map.orders ?? [],
    qr: map.qr ?? DEFAULTS.qr,
    admin: map.admin ?? DEFAULTS.admin,
  };
}

export async function getValue(key: string): Promise<any> {
  await ready();
  const { rows } = await sql`SELECT value FROM app_kv WHERE key = ${key}`;
  return rows[0]?.value;
}

export async function setValue(key: string, value: any) {
  await ready();
  await sql`INSERT INTO app_kv (key, value)
            VALUES (${key}, ${JSON.stringify(value)}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}::jsonb`;
}

/** Pure reducer used for array collections — easy to unit-check. */
export function applyOp(arr: any[], op: string, data: any): any[] {
  const list = Array.isArray(arr) ? arr : [];
  switch (op) {
    case "insert":
      return [data, ...list];
    case "update":
      return list.map((el) => (el.id === data.id ? { ...el, ...data.patch } : el));
    case "delete":
      return list.filter((el) => el.id !== data.id);
    case "replaceAll":
      return Array.isArray(data.items) ? data.items : list;
    default:
      return list;
  }
}
