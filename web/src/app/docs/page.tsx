import Link from "next/link";
import { GACHA_ODDS } from "@/lib/gacha";

const SPLIT = [
  { share: "50%", where: "Gacha pot", why: "Funds the prizes for the people who share every day." },
  { share: "50%", where: "Treasury", why: "Hosting, tooling, and the demo reserve." },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-eel">Docs</h1>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">The board</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          Anyone can list a project, an ad, or a link by paying in USDC. The amount you pay is your
          rank. MON is only ever used for gas.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>Three boards over the same spend: All-time, Today, and Daily.</li>
          <li>A minimum of 10 USDC starts a listing.</li>
          <li>To take first place you must beat the top listing by at least 5 USDC.</li>
          <li>Paying the same link again raises your own rank, and you only pay the difference.</li>
          <li>Only the first payer of a link can raise it, so nobody can take your rank.</li>
          <li>Ties keep their order: the earlier listing sits higher.</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">Where the money goes</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          Every USDC payment is split the moment it arrives, on-chain.
        </p>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-extrabold uppercase tracking-wider text-hare">
              <th className="pb-1">Share</th>
              <th className="pb-1">Where</th>
              <th className="pb-1">Why</th>
            </tr>
          </thead>
          <tbody>
            {SPLIT.map((row) => (
              <tr key={row.where} className="border-t-2 border-polar">
                <td className="py-2 font-extrabold text-mon-dark">{row.share}</td>
                <td className="py-2 font-bold text-eel">{row.where}</td>
                <td className="py-2 font-semibold text-wolf">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">The gacha</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          You do not need to pay. Share the board once a day and you unlock one spin. Prizes are paid
          in USDC, and the pot can never pay out more than it holds.
        </p>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-extrabold uppercase tracking-wider text-hare">
              <th className="pb-1">Prize</th>
              <th className="pb-1 text-right">Chance</th>
            </tr>
          </thead>
          <tbody>
            {GACHA_ODDS.map((row) => (
              <tr key={row.tier} className="border-t-2 border-polar">
                <td className="py-2 font-bold text-eel">
                  {row.amount > 0 ? `${row.amount} USDC` : "Zonk"}
                </td>
                <td className="py-2 text-right font-extrabold text-mon-dark">
                  {row.probability}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm font-semibold text-wolf">
          Some zonks are super zonks, which ask you to share again before your next spin unlocks.
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">Fairness and honesty</h2>
        <ul className="mt-1 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>The draw commits to an outcome before revealing it, so it can be checked.</li>
          <li>It is not a certified random number generator. It is hackathon-grade and labelled.</li>
          <li>Prizes are capped by the pot, so a spin can never pay more than the pot holds.</li>
          <li>Most spins are a zonk. The gacha is a reward for sharing, not a paid lottery.</li>
          <li>
            Everything runs on Monad testnet, so the tokens are worth nothing. Nothing here is an
            investment.
          </li>
          <li>Higher on the board means someone paid more, not that a project is better.</li>
        </ul>
      </section>

      <Link href="/" className="btn btn-mon w-fit">
        Back to the board
      </Link>
    </div>
  );
}
