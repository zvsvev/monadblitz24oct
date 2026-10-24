"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBoardData } from "@/components/board-view";
import { RaiseForm } from "@/components/raise-form";
import { formatUsd } from "@/lib/format";
import { displayUrl } from "@/lib/url";

export default function BoardDetailPage() {
  const params = useParams<{ key: string }>();
  const key = (params?.key ?? "").toLowerCase();
  const { listings, loading } = useBoardData();
  const listing = listings.find((l) => l.key.toLowerCase() === key);

  if (loading) {
    return <div className="card text-sm font-bold text-hare">Loading…</div>;
  }

  if (!listing) {
    return (
      <div className="card flex flex-col gap-2">
        <p className="text-sm font-bold text-wolf">This listing is not on the board.</p>
        <Link href="/" className="btn btn-mon btn-sm w-fit">
          Back to the board
        </Link>
      </div>
    );
  }

  const rank = [...listings].sort((a, b) => b.totalUsd - a.totalUsd).findIndex((l) => l.key === listing.key) + 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className={`rank-badge ${rank === 1 ? "rank-badge-top" : ""}`}>#{rank}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold text-eel">{listing.title}</h1>
          <a
            href={listing.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs font-bold text-mon"
          >
            {displayUrl(listing.url)}
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="hud-pill">all-time {formatUsd(listing.totalUsd)}</span>
        <span className="hud-pill">today {formatUsd(listing.todayUsd)}</span>
        {listing.demo && <span className="pill bg-bee/20 text-bee-dark">demo data</span>}
      </div>

      <RaiseForm listingKey={listing.key as `0x${string}`} />

      <Link href="/" className="btn btn-ghost btn-sm w-fit">
        Back to the board
      </Link>
    </div>
  );
}
