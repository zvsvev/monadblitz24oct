/**
 * The gacha odds table. This is the single source of truth for the published probabilities, the
 * demo draw, and the tier ids the pot pays out. The amounts mirror `GachaPot.tierAmount`.
 *
 * Only USDC is ever a prize; MON is gas and is never paid out.
 */

export type GachaTier =
  | "zonk"
  | "super-zonk"
  | "usdc-100"
  | "usdc-50"
  | "usdc-10"
  | "usdc-1"
  | "usdc-0.05"
  | "usdc-0.01";

export type GachaOddsRow = {
  tier: GachaTier;
  /** Prize amount in USDC, 0 for a zonk. */
  amount: number;
  /** GachaPot tier id. */
  tierId: number;
  /** Published win chance, in percent. */
  probability: number;
};

/** Odds are shown in this order, biggest prize first, zonk last. They sum to 100. */
export const GACHA_ODDS: GachaOddsRow[] = [
  { tier: "usdc-100", amount: 100, tierId: 6, probability: 1 },
  { tier: "usdc-50", amount: 50, tierId: 5, probability: 3 },
  { tier: "usdc-10", amount: 10, tierId: 4, probability: 5 },
  { tier: "usdc-1", amount: 1, tierId: 3, probability: 10 },
  { tier: "usdc-0.05", amount: 0.05, tierId: 2, probability: 20 },
  { tier: "usdc-0.01", amount: 0.01, tierId: 1, probability: 30 },
  { tier: "zonk", amount: 0, tierId: 0, probability: 31 },
];

export const SUPER_ZONK_TIER_ID = 0;
/** Share of the zonk band that is a super zonk, i.e. one that asks you to share again. */
const SUPER_ZONK_SHARE = 0.15;

export type GachaOutcome = {
  tier: GachaTier;
  label: string;
  amountLabel: string;
  amount: number;
  tone: "win" | "big" | "junk" | "debt";
};

export function tierIdFor(tier: GachaTier): number {
  if (tier === "super-zonk") return SUPER_ZONK_TIER_ID;
  return GACHA_ODDS.find((row) => row.tier === tier)?.tierId ?? 0;
}

function label(amount: number): string {
  const value = amount >= 1 ? amount.toLocaleString("en-US") : amount.toString();
  return `${value} USDC`;
}

function tone(amount: number): GachaOutcome["tone"] {
  if (amount >= 10) return "big";
  if (amount > 0) return "win";
  return "junk";
}

/** Weighted draw over the published odds. Kept out of React so the purity lint stays happy. */
export function drawOutcome(seed: number): GachaOutcome {
  const total = GACHA_ODDS.reduce((sum, row) => sum + row.probability, 0);
  let roll = Math.abs(Math.floor(seed)) % total;

  for (const row of GACHA_ODDS) {
    if (roll < row.probability) {
      if (row.tier === "zonk" && (Math.abs(Math.floor(seed / 7)) % 100) < SUPER_ZONK_SHARE * 100) {
        return {
          tier: "super-zonk",
          label: "Super zonk",
          amountLabel: "Share again before your next spin",
          amount: 0,
          tone: "debt",
        };
      }
      return {
        tier: row.tier,
        label: row.amount > 0 ? label(row.amount) : "Zonk",
        amountLabel: row.amount > 0 ? label(row.amount) : "Nothing this time",
        amount: row.amount,
        tone: tone(row.amount),
      };
    }
    roll -= row.probability;
  }

  const last = GACHA_ODDS[GACHA_ODDS.length - 1];
  return { tier: last.tier, label: "Zonk", amountLabel: "Nothing this time", amount: 0, tone: "junk" };
}

/** Draw with a fresh timestamp seed, kept out of component bodies for the purity lint. */
export function drawOutcomeNow(): GachaOutcome {
  return drawOutcome(Date.now());
}
