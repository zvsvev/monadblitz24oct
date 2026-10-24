"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useReadContract } from "wagmi";
import { cn } from "@/lib/cn";
import { HelpNote } from "@/components/help-note";
import { ADDRESSES, NATIVE, boardAbi, isDeployed, potAbi } from "@/lib/contracts";
import { DEMO_LISTINGS } from "@/lib/demo";
import { formatMon, formatUsd } from "@/lib/format";
import { displayUrl } from "@/lib/url";

export type BoardListing = {
  key: string;
  title: string;
  url: string;
  owner: string;
  totalUsd: number;
  todayUsd: number;
  createdAt: number;
  demo?: boolean;
};

type Tab = "all" | "today" | "daily";

export function useBoardData() {
  const client = usePublicClient();

  const query = useQuery({
    queryKey: ["board", isDeployed ? "live" : "demo", client?.chain?.id ?? 0],
    queryFn: async (): Promise<BoardListing[]> => {
      if (!isDeployed || !client) {
        return DEMO_LISTINGS.map((d) => ({
          key: d.key,
          title: d.title,
          url: d.url,
          owner: d.owner,
          totalUsd: d.totalUsd,
          todayUsd: d.todayUsd,
          createdAt: d.createdAt,
          demo: true,
        }));
      }

      const count = (await client.readContract({
        address: ADDRESSES.board,
        abi: boardAbi,
        functionName: "listingCount",
      })) as bigint;
      const n = Number(count);
      if (n === 0) return [];

      const day = (await client.readContract({
        address: ADDRESSES.board,
        abi: boardAbi,
        functionName: "currentDay",
      })) as bigint;

      const keys = await Promise.all(
        Array.from({ length: n }, (_, i) =>
          client.readContract({
            address: ADDRESSES.board,
            abi: boardAbi,
            functionName: "keyAt",
            args: [BigInt(i)],
          }),
        ),
      );

      return Promise.all(
        keys.map(async (key) => {
          const [listing, today] = await Promise.all([
            client.readContract({
              address: ADDRESSES.board,
              abi: boardAbi,
              functionName: "getListing",
              args: [key],
            }),
            client.readContract({
              address: ADDRESSES.board,
              abi: boardAbi,
              functionName: "dayUsd",
              args: [key, day],
            }),
          ]);
          return {
            key,
            title: listing.title,
            url: listing.url,
            owner: listing.owner,
            totalUsd: Number(listing.totalUsd) / 1e6,
            todayUsd: Number(today) / 1e6,
            createdAt: Number(listing.createdAt),
          } satisfies BoardListing;
        }),
      );
    },
  });

  return { listings: query.data ?? [], loading: query.isLoading, reload: query.refetch };
}

export function PotHud() {
  const { data } = useReadContract({
    address: ADDRESSES.gachaPot,
    abi: potAbi,
    functionName: "potBalance",
    args: [NATIVE],
    query: { enabled: isDeployed },
  });

  const native = typeof data === "bigint" ? data : 0n;
  return (
    <span className="hud-pill">
      <span aria-hidden>🪙</span> pot {isDeployed ? formatMon(native) : "0.5 MON (demo)"}
    </span>
  );
}

function RankRow({ rank, listing }: { rank: number; listing: BoardListing }) {
  return (
    <div className="list-row">
      <span className={cn("rank-badge", rank === 1 && "rank-badge-top")}>{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-eel">{listing.title}</p>
        <p className="truncate text-xs font-bold text-hare">{displayUrl(listing.url)}</p>
      </div>
      <span className="pill bg-feather/10 text-feather-dark">{formatUsd(listing.totalUsd)}</span>
      <Link href={`/board/${listing.key}`} className="btn btn-blue btn-sm shrink-0">
        Raise
      </Link>
    </div>
  );
}

export function BoardView() {
  const { listings, loading } = useBoardData();
  const [tab, setTab] = useState<Tab>("all");

  const sorted = useMemo(() => {
    const rows = [...listings];
    if (tab === "all") return rows.sort((a, b) => b.totalUsd - a.totalUsd);
    return rows.sort((a, b) => b.todayUsd - a.todayUsd);
  }, [listings, tab]);

  const isDemo = listings.some((l) => l.demo);

  return (
    <section className="rounded-3xl border-2 border-b-4 border-swan p-4">
      <div className="mb-3 flex items-start gap-2">
        <HelpNote title="Board notes">
          <ul className="flex flex-col gap-2">
            <li>
              <PotHud />
            </li>
            <li>
              <span className="hud-pill">
                <span aria-hidden>🔥</span> share daily
              </span>
            </li>
            <li>
              <span className="hud-pill">rank = what you pay</span>
            </li>
          </ul>
          <p className="mt-3">
            Higher on the board means a bigger payment, not a better project. Pay more than the top
            listing to take first place. Right now everything is demo data because the contracts are
            not deployed yet.
          </p>
        </HelpNote>
        {isDemo && <span className="pill ml-auto bg-bee/20 text-bee-dark">demo data</span>}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button className={cn("tab", tab === "all" && "tab-selected")} onClick={() => setTab("all")}>
          All-time
        </button>
        <button
          className={cn("tab", tab === "today" && "tab-selected")}
          onClick={() => setTab("today")}
        >
          Today
        </button>
        <button
          className={cn("tab", tab === "daily" && "tab-selected")}
          onClick={() => setTab("daily")}
        >
          Daily
        </button>
      </div>

      {tab === "daily" && (
        <p className="mb-3 text-xs font-bold text-hare">
          The Daily board shows today&apos;s spend and freezes at midnight UTC.
        </p>
      )}

      {loading ? (
        <div className="card text-sm font-bold text-hare">Loading the board…</div>
      ) : sorted.length === 0 ? (
        <div className="card text-sm font-bold text-wolf">
          Nobody is on the board yet.{" "}
          <Link href="/list" className="text-macaw">
            Be the first to list.
          </Link>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {sorted.map((listing, index) => (
            <li key={listing.key}>
              <RankRow rank={index + 1} listing={listing} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
