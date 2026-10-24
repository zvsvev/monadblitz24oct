import { keccak256, toBytes } from "viem";

/**
 * Seed data used only when the board is not yet deployed (no NEXT_PUBLIC_BUZZME), so the
 * deployed site renders a real, playable demo instead of an empty list. Clearly labelled as demo
 * data in the UI.
 */
export type DemoListing = {
  key: string;
  title: string;
  url: string;
  owner: string;
  totalUsd: number;
  todayUsd: number;
  createdAt: number;
};

function keyFor(url: string): string {
  return keccak256(toBytes(url));
}

const RAW: Array<Omit<DemoListing, "key">> = [
  {
    title: "Monad Moguls",
    url: "https://monadmoguls.xyz",
    owner: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
    totalUsd: 420,
    todayUsd: 96,
    createdAt: 1761200000,
  },
  {
    title: "BlitzKit",
    url: "https://blitzkit.dev",
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    totalUsd: 305,
    todayUsd: 54,
    createdAt: 1761300000,
  },
  {
    title: "Papan Kreatif",
    url: "https://papancreative.id",
    owner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    totalUsd: 210,
    todayUsd: 210,
    createdAt: 1761400000,
  },
  {
    title: "Farcaster Frames Lab",
    url: "https://frameslab.xyz",
    owner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    totalUsd: 150,
    todayUsd: 0,
    createdAt: 1761500000,
  },
  {
    title: "Duo Dev Shop",
    url: "https://duodev.shop",
    owner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    totalUsd: 95,
    todayUsd: 30,
    createdAt: 1761600000,
  },
  {
    title: "Zonk Collectors Club",
    url: "https://zonkclub.fun",
    owner: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    totalUsd: 60,
    todayUsd: 60,
    createdAt: 1761700000,
  },
];

export const DEMO_LISTINGS: DemoListing[] = RAW.map((r) => ({ ...r, key: keyFor(r.url) }));

export function demoListingByKey(key: string): DemoListing | undefined {
  return DEMO_LISTINGS.find((l) => l.key.toLowerCase() === key.toLowerCase());
}

export type DemoOutcome = {
  tier: "zonk" | "super-zonk" | "mon" | "big-mon" | "usdc" | "big-usdc";
  label: string;
  amountLabel: string;
  tone: "win" | "big" | "junk" | "debt";
};

const TABLE: Array<{ weight: number; outcome: DemoOutcome }> = [
  {
    weight: 45,
    outcome: { tier: "zonk", label: "Zonk", amountLabel: "Nothing this time", tone: "junk" },
  },
  {
    weight: 15,
    outcome: {
      tier: "super-zonk",
      label: "Super zonk",
      amountLabel: "Share again to unlock tomorrow",
      tone: "debt",
    },
  },
  {
    weight: 28,
    outcome: { tier: "mon", label: "Small MON", amountLabel: "0.5 MON", tone: "win" },
  },
  {
    weight: 8,
    outcome: { tier: "usdc", label: "USDC", amountLabel: "2 USDC", tone: "win" },
  },
  {
    weight: 3,
    outcome: { tier: "big-mon", label: "BIG MON", amountLabel: "10 MON", tone: "big" },
  },
  {
    weight: 1,
    outcome: { tier: "big-usdc", label: "BIG USDC", amountLabel: "25 USDC", tone: "big" },
  },
];

/** Weighted draw for the demo path. Kept out of React so the purity lint stays happy. */
export function drawDemoSpin(seed: number): DemoOutcome {
  const total = TABLE.reduce((sum, row) => sum + row.weight, 0);
  let roll = Math.abs(Math.floor(seed)) % total;
  for (const row of TABLE) {
    if (roll < row.weight) return row.outcome;
    roll -= row.weight;
  }
  return TABLE[0].outcome;
}

/** Draw with a fresh timestamp seed, kept out of component bodies for the purity lint. */
export function drawDemoSpinNow(): DemoOutcome {
  return drawDemoSpin(Date.now());
}
