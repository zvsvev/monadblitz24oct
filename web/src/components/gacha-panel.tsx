"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { HelpNote } from "@/components/help-note";
import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/cn";
import { drawDemoSpinNow, type DemoOutcome } from "@/lib/demo";

const SITE = "https://supaboard.m31-ulinnuha.workers.dev";
const SHARE_TEXT = "Climbing the Supaboard billboard on Monad. Pay to rank, or share to spin the chest.";

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
  const [outcome, setOutcome] = useState<DemoOutcome | null>(null);
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
      const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
      if (data.ok) {
        setShared(true);
        setNote(`Share recorded. Streak count today: ${data.count}.`);
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
      const data = (await res.json()) as { ok?: boolean; outcome?: DemoOutcome; error?: string };
      if (data.ok && data.outcome) {
        setOutcome(data.outcome);
        setSpun(true);
        setNote(null);
      } else {
        setNote(data.error ?? "The chest is locked.");
      }
    } catch {
      setNote("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  // A local preview draw so the page is playable even before the API/binding is set up.
  function preview() {
    setOutcome(drawDemoSpinNow());
  }

  const links = shareLinks(address);
  const toneClass =
    outcome?.tone === "debt" || outcome?.tone === "junk" ? "prize-reveal-zonk" : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="gacha-card">
        <div className="flex items-center gap-3">
          <Mascot className="h-14 w-14" />
          <div>
            <p className="text-xl font-extrabold">The daily chest</p>
            <p className="text-sm font-bold text-white/90">
              Share Supaboard once a day, then spin for MON, USDC, or a zonk.
            </p>
          </div>
          <span className="ml-auto">
            <HelpNote title="Fairness">
              The draw uses a simple commit-and-reveal, which is checkable but not a certified random
              number generator. Prizes are capped by the pot, and most spins are a zonk.
            </HelpNote>
          </span>
        </div>
      </div>

      {!isConnected && (
        <p className="rounded-xl bg-polar px-3 py-2 text-xs font-bold text-wolf">
          Connect a wallet to record your share and spin.
        </p>
      )}

      <div className="card">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-wolf">
          1. Share the board
        </p>
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
        <p className="mt-2 text-xs font-bold text-hare">
          Opening a share link records your daily entry. One share, one spin, every day.
        </p>
      </div>

      <div className="card">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-wolf">2. Spin</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-purple"
            disabled={busy || !isConnected || !shared || spun}
            onClick={spin}
            type="button"
          >
            {busy ? "Spinning…" : spun ? "Spun today" : shared ? "Spin the chest" : "Share first"}
          </button>
          <button className="btn btn-gray btn-sm" onClick={preview} type="button">
            Preview a spin
          </button>
        </div>
        <p className="mt-2 text-xs font-bold text-hare">
          Demo build: the daily limit and the share debt are tracked in this browser session. With
          the database connected they hold per wallet per UTC day.
        </p>
        {note && <p className="mt-2 text-xs font-bold text-macaw">{note}</p>}
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
          {outcome.tone === "big" && (
            <p className="mt-3 text-xs font-bold text-feather-dark">
              A big one. Paid on-chain from the chest.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
