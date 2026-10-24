-- BuzzMe off-chain state (Cloudflare D1).
-- Apply with: wrangler d1 execute buzzme --file=./d1/schema.sql --remote

CREATE TABLE IF NOT EXISTS shares (
  address  TEXT NOT NULL,
  day      TEXT NOT NULL,          -- UTC day, yyyy-mm-dd
  count    INTEGER NOT NULL DEFAULT 0,
  referral TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (address, day)
);

CREATE TABLE IF NOT EXISTS players (
  address  TEXT PRIMARY KEY,
  debt     INTEGER NOT NULL DEFAULT 0,  -- 1 while a super-zonk share debt is outstanding
  streak   INTEGER NOT NULL DEFAULT 0,
  last_day TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS spins (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  address    TEXT NOT NULL,
  day        TEXT NOT NULL,
  tier       TEXT NOT NULL,
  outcome    TEXT NOT NULL,
  tx_hash    TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spins_address ON spins (address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shares_day ON shares (day);
