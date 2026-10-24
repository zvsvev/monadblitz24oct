"use client";

import Link from "next/link";
import { useState } from "react";
import { keccak256, parseEther, parseUnits, toBytes } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { HelpNote } from "@/components/help-note";
import { cn } from "@/lib/cn";
import { ADDRESSES, boardAbi, erc20Abi, isDeployed } from "@/lib/contracts";
import { normalizeUrl } from "@/lib/url";

type Token = "MON" | "USDC";

export function ListForm() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [token, setToken] = useState<Token>("MON");
  const [amount, setAmount] = useState("10");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [listedKey, setListedKey] = useState<string | null>(null);

  const normalized = normalizeUrl(url);
  const canSubmit = isDeployed && isConnected && !!normalized && title.trim().length > 0 && Number(amount) > 0;

  async function submit() {
    if (!normalized || !publicClient) return;
    setBusy(true);
    setStatus("Waiting for your wallet…");
    try {
      if (token === "MON") {
        const hash = await writeContractAsync({
          address: ADDRESSES.board,
          abi: boardAbi,
          functionName: "list",
          args: [normalized, title.trim()],
          value: parseEther(amount),
        });
        setStatus("Placing your listing…");
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        const units = parseUnits(amount, 6);
        const approveHash = await writeContractAsync({
          address: ADDRESSES.usdc,
          abi: erc20Abi,
          functionName: "approve",
          args: [ADDRESSES.board, units],
        });
        setStatus("Approving USDC…");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        const listHash = await writeContractAsync({
          address: ADDRESSES.board,
          abi: boardAbi,
          functionName: "listERC20",
          args: [normalized, title.trim(), ADDRESSES.usdc, units],
        });
        setStatus("Placing your listing…");
        await publicClient.waitForTransactionReceipt({ hash: listHash });
      }
      setListedKey(keccak256(toBytes(normalized)));
      setStatus("You are on the board!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message.split("\n")[0] : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (listedKey) {
    return (
      <div className="card animate-pop text-center">
        <p className="text-lg font-extrabold text-feather-dark">You made the board.</p>
        <p className="mt-1 text-sm font-bold text-wolf">
          {title} is live. You can raise your rank any time.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/" className="btn btn-green btn-sm">
            See the board
          </Link>
          <Link href={`/board/${listedKey}`} className="btn btn-blue btn-sm">
            Open listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-extrabold text-eel">List on Supaboard</h2>
        <HelpNote title="Rules">
          A minimum of $10 equivalent starts a listing. To take first place you must beat the top
          listing by at least $5. Paying the same URL again raises your own rank by the difference.
        </HelpNote>
      </div>

      {!isDeployed && (
        <p className="mb-3 rounded-xl bg-bee/20 px-3 py-2 text-xs font-bold text-bee-dark">
          The contracts are not deployed yet, so listing is disabled. This form is wired and ready.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-wolf">Link</span>
          <input
            className="input"
            placeholder="yoursite.xyz"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {url && !normalized && (
            <span className="text-xs font-bold text-cardinal">That does not look like a website.</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-wolf">Title</span>
          <input
            className="input"
            placeholder="Your project name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-wolf">Pay with</span>
          <div className="flex gap-2">
            {(["MON", "USDC"] as Token[]).map((t) => (
              <button
                key={t}
                type="button"
                className={cn("tab", token === t && "tab-selected")}
                onClick={() => setToken(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-wolf">
            Amount ({token})
          </span>
          <input
            className="input"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="text-xs font-bold text-hare">
            This becomes your rank. 1 MON is treated as $1 in the demo.
          </span>
        </label>

        <button
          className="btn btn-green"
          disabled={!canSubmit || busy}
          onClick={submit}
          type="button"
        >
          {busy ? "Working…" : "Pay and list"}
        </button>

        {!isConnected && isDeployed && (
          <p className="text-xs font-bold text-wolf">Connect a wallet to list.</p>
        )}
        {address && (
          <p className="text-xs font-bold text-hare">Paying as {address}</p>
        )}
        {status && <p className="text-xs font-bold text-macaw">{status}</p>}
      </div>
    </div>
  );
}
