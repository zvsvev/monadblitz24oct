import Link from "next/link";

const SPLIT = [
  { share: "50%", where: "Chest", why: "Rewards the people who share the board every day." },
  { share: "50%", where: "Treasury", why: "Hosting, tooling, and the demo reserve." },
];

export default function HowPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-eel">How it works</h1>
        <p className="mt-1 text-sm font-bold text-wolf">
          The short version: pay to climb the board, or share to play the chest.
        </p>
      </div>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">The billboard</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          Anyone can list a project, an ad, or a link by paying in MON or USDC. The amount you pay is
          your rank. There are three boards over the same spend: All-time, Today, and Daily.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>To take first place you must beat the top listing by at least $5 equivalent.</li>
          <li>Paying the same link again raises your own rank, and you only pay the difference.</li>
          <li>Only the first payer of a link can raise it, so nobody can take your rank.</li>
          <li>Ties keep their order: the earlier listing sits higher.</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">Where the money goes</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          Every placement payment is split the moment it arrives, on-chain.
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
                <td className="py-2 font-extrabold text-feather-dark">{row.share}</td>
                <td className="py-2 font-bold text-eel">{row.where}</td>
                <td className="py-2 font-semibold text-wolf">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">The daily chest</h2>
        <p className="mt-1 text-sm font-semibold text-wolf">
          You do not need to pay to take part. Share the board once a day and you unlock one spin.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>
            <span className="font-bold text-eel">MON</span> and{" "}
            <span className="font-bold text-eel">BIG MON</span>: a prize paid on-chain from the chest.
          </li>
          <li>
            <span className="font-bold text-eel">USDC</span> and{" "}
            <span className="font-bold text-eel">BIG USDC</span>: a stablecoin prize, paid on-chain.
          </li>
          <li>
            <span className="font-bold text-cardinal">Zonk</span>: nothing this time, but your streak
            is safe.
          </li>
          <li>
            <span className="font-bold text-cardinal">Super zonk</span>: share again before your next
            spin unlocks. It costs no money and takes nothing back.
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-extrabold text-eel">Fairness and honesty</h2>
        <ul className="mt-1 list-disc pl-5 text-sm font-semibold text-wolf">
          <li>
            The draw commits to an outcome before revealing it, so it can be checked, but it is not a
            certified random number generator.
          </li>
          <li>Prizes can never be paid out beyond what the chest holds.</li>
          <li>Most spins are a zonk. The chest is a reward for sharing, not a paid lottery.</li>
          <li>
            Everything runs on Monad testnet, so the tokens are worth nothing. Nothing here is an
            investment.
          </li>
        </ul>
      </section>

      <Link href="/" className="btn btn-green w-fit">
        Back to the board
      </Link>
    </div>
  );
}
