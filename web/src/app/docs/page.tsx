import Link from "next/link";

const SPLIT = [
  { share: "50%", where: "Gacha pot", why: "Rewards the people who share the board every day." },
  { share: "50%", where: "Treasury", why: "Hosting, tooling, and the demo reserve." },
];

const TIERS = [
  { name: "MON", note: "A small prize, paid on-chain from the pot." },
  { name: "BIG MON", note: "A larger prize, capped by the pot." },
  { name: "USDC", note: "A small stablecoin prize, paid on-chain." },
  { name: "BIG USDC", note: "A larger stablecoin prize, capped by the pot." },
  { name: "Zonk", note: "Nothing this time. Your streak is safe." },
  { name: "Super zonk", note: "Share again before your next spin unlocks." },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-eel">Docs</h1>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">The board</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          Anyone can list a project, an ad, or a link by paying in MON or USDC. The amount you pay is
          your rank.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>Three boards over the same spend: All-time, Today, and Daily.</li>
          <li>To take first place you must beat the top listing by at least $5 equivalent.</li>
          <li>Paying the same link again raises your own rank, and you only pay the difference.</li>
          <li>Only the first payer of a link can raise it, so nobody can take your rank.</li>
          <li>Ties keep their order: the earlier listing sits higher.</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">Where the money goes</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          Every payment is split the moment it arrives, on-chain.
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
          You do not need to pay. Share the board once a day and you unlock one spin.
        </p>
        <ul className="mt-2 flex flex-col gap-1 text-sm font-semibold text-wolf">
          {TIERS.map((tier) => (
            <li key={tier.name}>
              <span className="font-extrabold text-eel">{tier.name}</span>: {tier.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">Fairness and honesty</h2>
        <ul className="mt-1 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>The draw commits to an outcome before revealing it, so it can be checked.</li>
          <li>It is not a certified random number generator. It is hackathon-grade and labelled.</li>
          <li>Prizes can never be paid out beyond what the pot holds.</li>
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
