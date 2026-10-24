"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useConnectors } from "wagmi";
import { cn } from "@/lib/cn";
import { shortAddress } from "@/lib/format";
import { Mascot } from "@/components/mascot";

const LINKS = [
  { href: "/", label: "Board" },
  { href: "/list", label: "List" },
  { href: "/dashboard", label: "Profile" },
];

function WalletButton() {
  const { address, isConnected } = useAccount();
  const connectors = useConnectors();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (isConnected && address) {
    return (
      <button className="btn btn-ghost btn-sm" onClick={() => disconnect()}>
        {shortAddress(address)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        className="btn btn-green btn-sm"
        onClick={() => (connectors.length > 1 ? setOpen((v) => !v) : connect({ connector: connectors[0] }))}
        disabled={connectors.length === 0}
      >
        {connectors.length === 0 ? "No wallet" : "Connect"}
      </button>
      {open && connectors.length > 1 && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border-2 border-b-4 border-swan bg-white p-2">
          {connectors.map((c) => (
            <button
              key={c.uid}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-eel hover:bg-polar"
              onClick={() => {
                connect({ connector: c });
                setOpen(false);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b-2 border-swan bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Mascot className="h-8 w-8" />
          <span className="text-lg font-extrabold tracking-tight text-feather-dark">supaboard</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider",
                  active ? "bg-macaw/10 text-macaw" : "text-wolf hover:text-eel",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <WalletButton />
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider",
                active ? "bg-macaw/10 text-macaw" : "text-wolf",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
