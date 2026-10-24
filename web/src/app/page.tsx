import Link from "next/link";
import { BoardView } from "@/components/board-view";
import { Mascot } from "@/components/mascot";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="pill bg-macaw/10 text-macaw">monad testnet</span>
          <span className="pill bg-feather/10 text-feather-dark">50% funds the gacha</span>
        </div>
        <Mascot className="mx-auto mb-1 h-20 w-20" />
        <h1 className="text-4xl font-extrabold leading-tight text-eel">
          Pay to be on top.
          <br />
          Share to try gacha.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold text-wolf">
          Put your project, ad, or link on the board and climb it with MON or USDC. Or spend nothing,
          share the board once a day, and try gacha for MON, USDC, or a zonk.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/list" className="btn btn-green">
            List your project
          </Link>
          <Link href="/dashboard" className="btn btn-purple">
            Try gacha
          </Link>
        </div>
      </section>

      <BoardView />

      <section className="card">
        <h2 className="mb-2 text-lg font-extrabold text-eel">The two loops</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-feather-dark">
              Pay to rank
            </p>
            <p className="text-sm font-semibold text-wolf">
              List a link, then raise it to climb. Every payment is split 50% to the gacha, 50% to
              the treasury, on-chain and visible.
            </p>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-beetle-dark">
              Share to spin
            </p>
            <p className="text-sm font-semibold text-wolf">
              Share the board once a day for one spin. Win MON or USDC, or get a zonk. A super zonk
              just means share again next time.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs font-bold text-hare">
          New here?{" "}
          <Link href="/how" className="text-macaw">
            Read how it works
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
