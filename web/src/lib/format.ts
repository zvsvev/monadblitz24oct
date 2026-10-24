/** USD scores use 6 decimals in the contracts: 1e6 = $1. */
export function formatUsd(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) / 1e6 : value / 1e6;
  if (n >= 1000) return `$${Math.round(n).toLocaleString("en-US")}`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatMon(wei: bigint | number): string {
  const n = typeof wei === "bigint" ? Number(wei) / 1e18 : wei / 1e18;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 4 })} MON`;
}

export function formatUsdc(units: bigint | number): string {
  const n = typeof units === "bigint" ? Number(units) / 1e6 : units / 1e6;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function shortKey(key: string): string {
  return key.slice(0, 10);
}
