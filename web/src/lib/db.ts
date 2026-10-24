/**
 * Off-chain store for shares, the share debt, and the spin log. Uses Cloudflare D1 when the `DB`
 * binding is available and falls back to an in-memory store otherwise, so the app runs locally with
 * zero cloud setup.
 */

export type SpinRow = {
  address: string;
  day: string;
  tier: string;
  outcome: string;
  tx_hash: string | null;
  created_at: number;
};

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
}

interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
}

async function getDb(): Promise<D1DatabaseLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const db = (ctx.env as { DB?: D1DatabaseLike }).DB;
    return db ?? null;
  } catch {
    return null;
  }
}

// In-memory fallback (dev / no binding).
const memShares = new Map<string, number>();
const memDebt = new Map<string, boolean>();
const memSpins: SpinRow[] = [];

/** True when a D1 binding is available. Without it, the demo enforces its rules in the browser. */
export async function hasStore(): Promise<boolean> {
  return (await getDb()) !== null;
}

function shareKey(address: string, day: string): string {
  return `${address.toLowerCase()}:${day}`;
}

export async function recordShare(address: string, day: string, referral: string): Promise<number> {
  const db = await getDb();
  const addr = address.toLowerCase();
  if (db) {
    await db
      .prepare(
        `INSERT INTO shares (address, day, count, referral) VALUES (?, ?, 1, ?)
         ON CONFLICT(address, day) DO UPDATE SET count = count + 1`,
      )
      .bind(addr, day, referral)
      .run();
    const row = await db
      .prepare(`SELECT count FROM shares WHERE address = ? AND day = ?`)
      .bind(addr, day)
      .first<{ count: number }>();
    return row?.count ?? 1;
  }
  const key = shareKey(addr, day);
  const next = (memShares.get(key) ?? 0) + 1;
  memShares.set(key, next);
  return next;
}

export async function shareCount(address: string, day: string): Promise<number> {
  const db = await getDb();
  const addr = address.toLowerCase();
  if (db) {
    const row = await db
      .prepare(`SELECT count FROM shares WHERE address = ? AND day = ?`)
      .bind(addr, day)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }
  return memShares.get(shareKey(addr, day)) ?? 0;
}

export async function setDebt(address: string, debt: boolean): Promise<void> {
  const db = await getDb();
  const addr = address.toLowerCase();
  if (db) {
    await db
      .prepare(
        `INSERT INTO players (address, debt, streak, last_day) VALUES (?, ?, 0, '')
         ON CONFLICT(address) DO UPDATE SET debt = ?`,
      )
      .bind(addr, debt ? 1 : 0, debt ? 1 : 0)
      .run();
    return;
  }
  memDebt.set(addr, debt);
}

export async function hasDebt(address: string): Promise<boolean> {
  const db = await getDb();
  const addr = address.toLowerCase();
  if (db) {
    const row = await db
      .prepare(`SELECT debt FROM players WHERE address = ?`)
      .bind(addr)
      .first<{ debt: number }>();
    return (row?.debt ?? 0) === 1;
  }
  return memDebt.get(addr) ?? false;
}

export async function clearDebt(address: string): Promise<void> {
  await setDebt(address, false);
}

export async function logSpin(row: SpinRow): Promise<void> {
  const db = await getDb();
  if (db) {
    await db
      .prepare(
        `INSERT INTO spins (address, day, tier, outcome, tx_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(row.address, row.day, row.tier, row.outcome, row.tx_hash, row.created_at)
      .run();
    return;
  }
  memSpins.push(row);
}

export async function listSpins(address: string): Promise<SpinRow[]> {
  const db = await getDb();
  const addr = address.toLowerCase();
  if (db) {
    const res = await db
      .prepare(`SELECT * FROM spins WHERE address = ? ORDER BY created_at DESC LIMIT 50`)
      .bind(addr)
      .all<SpinRow>();
    return res.results ?? [];
  }
  return memSpins.filter((s) => s.address.toLowerCase() === addr).slice().reverse();
}

/** UTC day key, yyyy-mm-dd. The gacha window is a UTC day, matching the contracts. */
export function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
