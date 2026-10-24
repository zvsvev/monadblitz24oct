"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/cn";
import { drawOutcomeNow, GACHA_ODDS, type GachaOutcome } from "@/lib/gacha";

const SITE = "https://thebuzzme.bond";
const SHARE_TEXT = "Climbing the BuzzMe billboard on Monad. Pay to rank, or share to try gacha.";

function shareLinks(address: string | undefined) {
  const referral = address ? `${SITE}/?ref=${address}` : SITE;
  const text = encodeURIComponent(`${SHARE_TEXT} ${referral}`);
  const url = encodeURIComponent(referral);
  return [
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${text}` },
    { label: "Share on Telegram", href: `https://t.me/share/url?url=${url}&text=${text}` },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${text}` },
  ];
}

export function GachaPanel() {
  const { address, isConnected } = useAccount();
  const [shared, setShared] = useState(false);
  const [spun, setSpun] = useState(false);
  const [outcome, setOutcome] = useState<GachaOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function recordShare() {
    if (!address) return;
    setBusy(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setShared(true);
        setNote(null);
      } else {
        setNote(data.error ?? "Could not record the share.");
      }
    } catch {
      setNote("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function spin() {
    if (!address) return;
    setBusy(true);
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = (await res.json()) as { ok?: boolean; outcome?: GachaOutcome; error?: string };
      if (data.ok && data.outcome) {
        setOutcome(data.outcome);
        setSpun(true);
        setNote(null);
      } else {
        setNote(data.error ?? "The gacha is locked.");
      }
    } catch {
      setNote("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  function preview() {
    setOutcome(drawOutcomeNow());
  }

  const links = shareLinks(address);
  const toneClass =
    outcome?.tone === "debt" || outcome?.tone === "junk" ? "prize-reveal-zonk" : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="gacha-card flex items-center gap-3">
        <Mascot className="h-12 w-12" />
        <p className="text-xl font-extrabold">Daily gacha</p>
      </div>

      {!isConnected && (
        <p className="rounded-xl bg-polar px-3 py-2 text-xs font-bold text-wolf">
          Connect a wallet to share and spin.
        </p>
      )}

      <div className="card">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-wolf">1. Share</p>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              className="btn btn-ghost btn-sm"
              href={l.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => void recordShare()}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-wolf">2. Spin</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-gacha"
            disabled={busy || !isConnected || !shared || spun}
            onClick={spin}
            type="button"
          >
            {busy ? "Spinning…" : spun ? "Spun today" : shared ? "Spin" : "Share first"}
          </button>
          <button className="btn btn-gray btn-sm" onClick={preview} type="button">
            Preview
          </button>
        </div>
        {note && <p className="mt-2 text-xs font-bold text-mon">{note}</p>}
      </div>

      {outcome && (
        <div
          className={cn(
            "prize-reveal",
            toneClass,
            outcome.tone === "junk" || outcome.tone === "debt" ? "animate-shake" : "animate-pop",
          )}
        >
          <p className="text-xs font-extrabold uppercase tracking-widest text-hare">You got</p>
          <p className="mt-1 text-3xl font-extrabold text-eel">{outcome.label}</p>
          <p className="mt-1 text-sm font-bold text-wolf">{outcome.amountLabel}</p>
          {outcome.tone === "debt" && (
            <p className="mt-3 text-xs font-bold text-cardinal">
              Share again before your next spin unlocks.
            </p>
          )}
        </div>
      )}

      <div className="card">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-wolf">
          Odds (1 spin = 1 draw)
        </p>
        <ul className="flex flex-col gap-1">
          {GACHA_ODDS.map((row) => (
            <li
              key={row.tier}
              className="flex items-center justify-between border-b-2 border-polar pb-1 text-sm font-bold text-eel last:border-0"
            >
              <span>{row.amount > 0 ? `${row.amount} USDC` : "Zonk"}</span>
              <span className="font-extrabold text-mon-dark">{row.probability}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold text-hare">
          Some zonks are super zonks, which ask you to share again. Prizes are always capped by the
          pot, so a spin can never pay more than the pot holds.
        </p>
      </div>
    </div>
  );
}
