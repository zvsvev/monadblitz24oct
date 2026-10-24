"use client";

import { useState } from "react";

/**
 * A quiet "?" affordance that hides explanatory notes until asked for. The panel opens in normal
 * flow directly below the trigger, so it stays inside whatever screen it lives in.
 */
export function HelpNote({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={`Help: ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-swan text-xs font-extrabold text-hare hover:border-macaw hover:text-macaw"
      >
        ?
      </button>
      {open && (
        <div className="mt-2 w-full rounded-2xl border-2 border-b-4 border-swan bg-white p-3 text-xs font-semibold text-wolf">
          <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-wide text-eel">
            {title}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}
