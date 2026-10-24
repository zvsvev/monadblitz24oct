import Link from "next/link";
import { ListForm } from "@/components/list-form";

export default function ListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-eel">Put yourself on the board</h1>
        <p className="mt-1 text-sm font-bold text-wolf">
          Pay in MON or USDC. The amount you pay becomes your rank, and half of it funds the daily
          chest for everyone else.
        </p>
      </div>
      <ListForm />
      <p className="text-xs font-bold text-hare">
        Not sure how ranking works?{" "}
        <Link href="/how" className="text-macaw">
          Read the rules
        </Link>
        .
      </p>
    </div>
  );
}
