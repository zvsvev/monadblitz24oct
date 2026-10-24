import { NextResponse } from "next/server";
import { listSpins } from "@/lib/db";

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address") ?? "";
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "A wallet address is required." }, { status: 400 });
  }
  const spins = await listSpins(address);
  return NextResponse.json({ spins });
}
