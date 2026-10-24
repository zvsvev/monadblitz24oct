import { NextResponse } from "next/server";
import { clearDebt, recordShare, utcDay } from "@/lib/db";

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
  const count = await recordShare(address, day, "");
  // A fresh share clears an outstanding super-zonk debt.
  await clearDebt(address);

  return NextResponse.json({ ok: true, day, count });
}
