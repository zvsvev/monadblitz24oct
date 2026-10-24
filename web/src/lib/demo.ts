import { keccak256, toBytes } from "viem";

/**
 * Seed data used only when the board is not yet deployed (no NEXT_PUBLIC_BUZZME), so the
 * deployed site renders a real, playable board instead of an empty list. Clearly labelled as demo
 * data in the UI. Values are in USD (the same 6-decimal score the contracts use).
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
    title: "Facebook",
    url: "https://facebook.com",
    owner: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
    totalUsd: 250_000,
    todayUsd: 42_000,
    createdAt: 1761200000,
  },
  {
    title: "Nvidia",
    url: "https://nvidia.com",
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    totalUsd: 186_000,
    todayUsd: 26_500,
    createdAt: 1761250000,
  },
  {
    title: "Tesla",
    url: "https://tesla.com",
    owner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    totalUsd: 152_000,
    todayUsd: 18_400,
    createdAt: 1761300000,
  },
  {
    title: "X",
    url: "https://x.com",
    owner: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    totalUsd: 121_500,
    todayUsd: 31_200,
    createdAt: 1761400000,
  },
  {
    title: "Telegram",
    url: "https://telegram.org",
    owner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    totalUsd: 98_400,
    todayUsd: 12_600,
    createdAt: 1761500000,
  },
  {
    title: "devweb3jogja",
    url: "https://devweb3jogja.dev",
    owner: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    totalUsd: 42_000,
    todayUsd: 9_000,
    createdAt: 1761600000,
  },
  {
    title: "Monad",
    url: "https://monad.xyz",
    owner: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    totalUsd: 36_800,
    todayUsd: 7_500,
    createdAt: 1761650000,
  },
];

export const DEMO_LISTINGS: DemoListing[] = RAW.map((r) => ({ ...r, key: keyFor(r.url) }));

export function demoListingByKey(key: string): DemoListing | undefined {
  return DEMO_LISTINGS.find((l) => l.key.toLowerCase() === key.toLowerCase());
}
