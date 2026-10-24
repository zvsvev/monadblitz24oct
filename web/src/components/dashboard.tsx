"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useBoardData } from "@/components/board-view";
import { HelpNote } from "@/components/help-note";
import { formatUsd } from "@/lib/format";
import { displayUrl } from "@/lib/url";

type SpinLite = {
  day: string;
  tier: string;
  outcome: string;
  tx_hash: string | null;
};

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const { listings } = useBoardData();

  const spinsQuery = useQuery({
    queryKey: ["spins", address],
    enabled: !!address,
    queryFn: async (): Promise<SpinLite[]> => {
      const res = await fetch(`/api/spins?address=${address}`);
      const data = (await res.json()) as { spins?: SpinLite[] };
      return data.spins ?? [];
    },
  });

  if (!isConnected || !address) {
    return (
      <div className="card text-sm font-bold text-wolf">
        Connect a wallet to see your listings, your streak, and your spins.
      </div>
    );
  }

  const mine = listings.filter((l) => l.owner.toLowerCase() === address.toLowerCase());
  const spins = spinsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-eel">Your listings</h2>
          <HelpNote title="Raising rank">
            Open a listing and pay the difference to climb. Only you can raise your own listing.
          </HelpNote>
        </div>
        {mine.length === 0 ? (
          <div className="card text-sm font-bold text-wolf">
            Nothing yet.{" "}
            <Link href="/list" className="text-macaw">
              List your first project.
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {mine.map((l) => (
              <li key={l.key}>
                <div className="list-row">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-eel">{l.title}</p>
                    <p className="truncate text-xs font-bold text-hare">{displayUrl(l.url)}</p>
                  </div>
                  <span className="pill bg-feather/10 text-feather-dark">
                    {formatUsd(l.totalUsd)}
                  </span>
                  <Link href={`/board/${l.key}`} className="btn btn-blue btn-sm">
                    Raise
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-extrabold text-eel">Your spins</h2>
        {spins.length === 0 ? (
          <div className="card text-sm font-bold text-wolf">
            No spins yet.{" "}
            <Link href="/gacha" className="text-macaw">
              Share and spin the chest.
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {spins.map((s, i) => (
              <li key={`${s.day}-${i}`} className="list-row">
                <span className="pill bg-polar text-wolf">{s.day}</span>
                <span className="flex-1 text-sm font-extrabold text-eel">{s.outcome}</span>
                {s.tx_hash && <span className="pill bg-macaw/10 text-macaw">on-chain</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
