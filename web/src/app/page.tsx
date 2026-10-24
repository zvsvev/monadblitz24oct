import Link from "next/link";
import { BoardView } from "@/components/board-view";
import { Mascot } from "@/components/mascot";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center">
        <Mascot className="mx-auto mb-1 h-20 w-20" />
        <h1 className="text-4xl font-extrabold leading-tight text-eel">
          Buzz to be on top.
          <br />
          Share to try gacha
        </h1>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/list" className="btn btn-mon">
            List your project
          </Link>
          <Link href="/dashboard" className="btn btn-green">
            Try gacha
          </Link>
        </div>
      </section>

      <BoardView />
    </div>
  );
}
