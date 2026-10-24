import { NextResponse } from "next/server";
import { hasDebt, hasStore, listSpins, logSpin, setDebt, shareCount, utcDay } from "@/lib/db";
import { drawDemoSpin } from "@/lib/demo";
import { onChainConfigured, runOnChainSpin } from "@/lib/pot";

export async function POST(req: Request) {
  let address = "";
  try {
    const body = (await req.json()) as { address?: string };
    address = body.address ?? "";
  } catch {
    // fall through to validation
  }

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "A wallet address is required." }, { status: 400 });
  }

  const day = utcDay();
  // Without a D1 binding the per-day rules are enforced in the browser, so the server just pays
  // the draw. With a binding, the share, the one-spin-a-day cap and the super-zonk debt all hold.
  const store = await hasStore();

  if (store) {
    const count = await shareCount(address, day);
    if (count === 0) {
      return NextResponse.json({ error: "Share first to unlock a spin." }, { status: 403 });
    }
    if (await hasDebt(address)) {
      return NextResponse.json(
        { error: "Super zonk: share again to unlock your next spin." },
        { status: 403 },
      );
    }
    const spins = await listSpins(address);
    if (spins.some((s) => s.day === day)) {
      return NextResponse.json(
        { error: "You already spun today. Come back tomorrow." },
        { status: 429 },
      );
    }
  }

  // The draw is fixed here, then committed and revealed on-chain when the payer is configured.
  const outcome = drawDemoSpin(Date.now());

  let txHashes: string[] | null = null;
  if (onChainConfigured()) {
    try {
      txHashes = await runOnChainSpin(address as `0x${string}`, outcome);
    } catch {
      txHashes = null;
    }
  }

  if (outcome.tier === "super-zonk") {
    await setDebt(address, true);
  }

  await logSpin({
    address,
    day,
    tier: outcome.tier,
    outcome: outcome.label,
    tx_hash: txHashes?.[1] ?? null,
    created_at: Date.now(),
  });

  return NextResponse.json({ ok: true, outcome, txHashes });
}
