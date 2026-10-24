"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { ADDRESSES, boardAbi, isDeployed } from "@/lib/contracts";

export function RaiseForm({ listingKey }: { listingKey: `0x${string}` }) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("10");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!publicClient) return;
    setBusy(true);
    setStatus("Waiting for your wallet…");
    try {
      const hash = await writeContractAsync({
        address: ADDRESSES.board,
        abi: boardAbi,
        functionName: "raise",
        args: [listingKey],
        value: parseEther(amount),
      });
      setStatus("Raising your rank…");
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Rank raised!");
    } catch (err) {
      setStatus(err instanceof Error ? err.message.split("\n")[0] : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-wolf">
        Raise your rank (MON)
      </p>
      <div className="flex items-end gap-2">
        <input
          className="input"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="btn btn-green shrink-0"
          type="button"
          disabled={busy || !isDeployed || !isConnected || Number(amount) <= 0}
          onClick={submit}
        >
          {busy ? "Working…" : "Add spend"}
        </button>
      </div>
      {!isDeployed && (
        <p className="mt-2 text-xs font-bold text-bee-dark">
          Demo mode: the contracts are not deployed yet, so raising is disabled.
        </p>
      )}
      {!isConnected && isDeployed && (
        <p className="mt-2 text-xs font-bold text-wolf">Connect a wallet to raise.</p>
      )}
      {address && <p className="mt-2 text-xs font-bold text-hare">Paying as {address}</p>}
      {status && <p className="mt-2 text-xs font-bold text-macaw">{status}</p>}
    </div>
  );
}
