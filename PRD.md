# PRD: Supaboard: Pay-to-Rank Billboards and a Daily Share-Gacha on Monad

**Version:** 1.1 · **Date:** 24 Oct 2026
**Supersedes:** v1.0. v1.1 moves the gacha inside the user profile (there is no separate gacha page)
and settles the landing copy: the call to action reads "Try gacha".

---

## 0. What Supaboard is

**Supaboard is a pay-to-rank billboard on Monad.** Anyone can put a project, an ad, or a link on the
board and stand above everyone else by paying in **MON or testnet USDC**. Rank is what you pay, and
nothing else. Three boards slice the same spend by time window: **All-time**, **Today**, and **Daily**.

**Nobody has to pay to take part.** A second loop rewards the people who promote the board: share
Supaboard once a day and you earn a **gacha spin**, with a small chance of MON or USDC and a much
larger chance of nothing at all. The gacha pool is funded by **50% of every placement payment**, so
the reward tracks the board's real revenue instead of printed emissions.

**The whole surface is dressed like Duolingo:** bright green, chunky rounded cards, big friendly
buttons, a mascot, streaks, and a celebration when you win. The board is meant to be fun to open, not
a table to be read.

### 0.1 The one-sentence version

Pay to climb a public billboard, share the board to spin a gacha that pays out real testnet rewards
from the money the billboard earns.

---

## 1. Thesis

**Why a billboard.** Every hackathon, launch week, and product hunt is a fight for a moment of
attention, and the fairest way to price attention is an auction. A pay-to-rank board turns that fight
into a single legible number: your spend. No algorithms, no editorial picks, just an open market where
the top of the page is whatever someone is willing to pay for it.

**Why pay-to-rank and not pixels or banner slots.** (This is a deliberate change from the surface
that inspired the idea, outbid.lol.) A ranked list needs no layout work, no image moderation at scale,
and no fixed inventory. It scales to any number of listings, it is trivial to verify on-chain, and it
reads the same on a phone as on a desktop. The ranking rule is also honest: everyone can see who paid
what and why they sit where they sit.

**Why a gacha, and why it is funded by revenue.** Attention has two sides: advertisers who pay and
audiences who promote. The gacha is how the board pays back the second side. Because it is funded by
**50% of placement revenue**, the reward cannot outrun the money the board actually makes. Tickets are
earned by sharing, never sold, which keeps it a reward scheme rather than a game of chance you buy
into.

**Why the share loop, not a referral fee.** A referral fee rewards one-off clicks. A daily share loop
rewards the habit of coming back: show up, share, spin, come back tomorrow. The streak is the product,
the prizes are the seasoning.

**Why Duolingo as the design language.** Pay-to-rank boards are inherently a little cold and
mechanical. Borrowing Duolingo's warmth (rounded shapes, one confident green, playful type, a mascot
who reacts to you) makes the board feel like a game you can win rather than a spreadsheet that ranks
you. That contrast is the point: a serious mechanism, wrapped in something friendly.

**Why Monad.** Pay-to-rank means many small payments at human speed: a placement, an outbid, a gacha
payout, each needing to clear without a modal and a fee that dwarfs the amount. Monad's 400ms blocks
and 800ms finality, at effectively free gas, make an in-page economy feel instant. It is EVM
compatible, so the standard tooling (Solidity, Foundry, wagmi) works unchanged.

---

## 2. The billboard

### 2.1 Listing

1. **Connect a wallet.** Any EVM wallet, or a Para embedded wallet created with email or a passkey.
2. **Describe the placement.** A URL or X handle, a title, an optional image URL, and a category.
3. **Pay.** Choose MON (native) or testnet USDC, and an amount. This amount becomes your rank.
4. **Appear on the board.** The listing is live as soon as the payment settles (about 800ms on Monad).

New listings are whole units with a minimum, and any amount above the minimum is accepted. Tuples are
keyed by the **normalized URL** (query string and trailing slash stripped, host lowercased), so
tracking parameters do not create duplicate ranks and platform links (App Store, Play Store, GitHub)
are keyed by path.

### 2.2 Ranking

- **Rank is spend.** A listing's position is its total spend on the board being viewed.
- **To take #1** you must beat the current #1 by a minimum increment (for example 5 USDC-equivalent).
  Paying less still places you at whatever rank that amount can take.
- **Ties** keep the order they were placed: the earlier listing sits higher.
- **Raising your own rank** costs only the difference. Enter the same URL again, name a new total, and
  the contract charges the gap.
- **You cannot be outbid out of your own listing.** Only the owner can raise a listing they created;
  the first payer on a URL owns it.

> Note on the last rule: this is the small print that stops a griefer from taking your rank by paying
> the difference. A listing is keyed by URL, and the creator is recorded once, on first list. See §10
> for the variant where anyone may boost a shared listing.

### 2.3 The three boards

| Board | Window | Rank is |
| --- | --- | --- |
| **All-time** | Every placement, forever | Cumulative spend on the listing. Never expires. |
| **Today** | Current UTC day | Spend since midnight UTC. Resets when the day turns. |
| **Daily** | Each UTC day, archived | Spend within that one day; past days freeze. |

One payment counts toward every board that includes its moment, so a single placement can rank you on
All-time and Today at once. The contract keeps a cumulative total plus a per-day bucket per listing,
so the boards are computed on-chain and need no indexer to be correct.

### 2.4 What you can list

- A product website. An X handle also fits (rendered as a profile card).
- **Not allowed:** chat or invite links (Telegram, WhatsApp, Discord, and similar), adult content,
  link shorteners, and affiliate or tracking URLs. Query parameters are stripped, so affiliate tags
  never survive.
- Categories are a light touch for display and filtering. They do not affect rank.

### 2.5 Content rules and enforcement

- A blocklist of scam and impersonation patterns is applied at listing time.
- A listing can be **delisted** by the operator, which removes it from the board view. The spend stays
  on record and is not refunded, because the payment is what is being sold.
- Delisting is a display action only; it does not touch the chain.

---

## 3. Revenue

Every placement payment is split at the moment it is received:

| Share | Where it goes | Why |
| --- | --- | --- |
| **50%** | Gacha pot | The reward the board pays back to the people who promote it. |
| **50%** | Treasury and operations | Hosting, tooling, reserve, and the demo seed. |

- The split is a standing commitment, published on the board the same way it is written here. It is a
  contract parameter (`gachaBps`), changeable only by the owner and visible on-chain.
- **MON and USDC are accounted for separately.** Both the pot and the treasury track two balances, so a
  USDC prize is paid from the USDC pool and a MON prize from the MON pool. Neither can quietly drain
  the other.
- No staking, no emissions, no yield. The only money that moves is money someone chose to spend.

---

## 4. The gacha

### 4.1 Earning a spin

- **Share the board.** A share intent (X, Telegram, or WhatsApp) carries a referral code tied to the
  wallet. The share is recorded server-side, one per UTC day per wallet.
- **Spin once per day.** A recorded share unlocks exactly one spin for that day. The spin is a
  commit-reveal round paid from the pot (see §4.3).

### 4.2 What you can win

| Tier | Prize | Rough odds | Notes |
| --- | --- | --- | --- |
| **Zonk** | Junk: a cosmetic badge or sticker | most spins | No value, never a fake prize. |
| **Super zonk** | Nothing, and a share debt | uncommon | You must share again before your next spin. |
| **MON** | A small MON prize | occasional | Paid on-chain from the MON pool. |
| **BIG MON** | A larger MON prize | rare | Solvency-capped. |
| **USDC** | A small USDC prize | occasional | Paid on-chain from the USDC pool. |
| **BIG USDC** | A larger USDC prize | very rare | Solvency-capped. |

Exact weights and prize sizes are contract and backend parameters, tuned so expected payout sits
below the pot's funding. They are published in the gacha section of the user profile, not hidden.

### 4.3 Fairness

- **Commit-reveal.** When you request a spin, the server commits to `keccak256(player, tier, amount,
  nonce)`. The reveal mixes in data that does not exist at commit time (a later block hash, or the
  user's own signature), so the outcome is fixed only after the commitment. Anyone can check the
  revealed tuple against the stored commitment.
- **Solvency cap.** A payout can never exceed the pot balance for its token. If a jackpot would
  overdraw the pool, the prize is capped rather than promised.
- **Honest label.** This is hackathon-grade randomness, not a hardware VRF, and the page says so.

### 4.4 Super zonk and the share debt

**Super zonk is the board's one twist on a pure reward.** It pays nothing, and it records a **share
debt**: the user must share again before their next spin unlocks. It costs no money and takes nothing
back. It exists to make the share loop, not just the prize, part of the game, and to give streaks a
reason to matter.

### 4.5 The streaks

Daily shares build a streak, shown as a Duolingo-style flame count in the profile next to the gacha. The streak is cosmetic for the Blitz (it gates nothing yet); the obvious next step is a
small odds boost, listed in §10.

---

## 5. Anti-abuse

Every loop above can be gamed. The mitigations, with the ones not shipped marked in §7:

| Attack | Mitigation |
| --- | --- |
| **Placement spam** | Minimum spend, per-wallet rate limits, a blocklist of scam and impersonation patterns. |
| **Rank squatting** | Listings are keyed by normalized URL; the creator is recorded once. A griefer cannot take a rank by paying the difference. |
| **Gacha farming (sybil)** | One spin per wallet per UTC day; spin requires a recorded share; per-wallet and per-IP rate limits. |
| **Gacha farming (share bots)** | The share is intent-based and honestly labelled; server-side deduplication per day, and a cheap share requirement still needs a distinct funded wallet. |
| **Pool draining** | Solvency cap, and a per-wallet daily payout cap. |
| **Commit-reveal manipulation** | The reveal mixes in post-commit entropy; the server cannot pick an outcome after seeing the user's data, and any player can verify the tuple. |
| **Super-zonk evasion** | The debt is server state keyed to the wallet; the next spin route refuses until a fresh share is recorded. |
| **Content abuse** | Blocklist, delisting, and human review of the top slots. |

None of this is perfect. It is written down so the trade-offs are legible, and the parts that are not
built are said plainly in §7 and §8.

---

## 6. Architecture and stack

```text
monadblitz24oct/
├── contracts/      # Foundry: Supaboard (pay-to-rank), GachaPot (+ tests, script/Deploy.s.sol)
├── web/            # Next.js App Router + shadcn + wagmi + Para; D1 for off-chain state
├── web/d1/         # schema.sql: listings metadata, shares, spins
├── indexer/        # (optional) Envio HyperIndex activity feed
└── skills/         # MONSKILLS
```

**On-chain vs off-chain, and why.**

- **On-chain:** every placement payment, the revenue split, the cumulative and per-day spend that
  defines rank, the gacha pot, and every prize payout. Money and rank must be trustless and
  independently checkable.
- **Off-chain:** listing metadata (title, image, category), share events, spin eligibility, the share
  debt, and the spin log. These carry no value and change often, so they live in a small Cloudflare D1
  database with a local fallback for development.

**Contracts (Monad testnet):**

- **`Supaboard`** receives placements, records spend, enforces the rank rules, and routes the 50/50
  split. It accepts native MON and any ERC-20 (testnet USDC), and normalizes MON to a USD score through
  a price seam the owner can point at a real feed.
- **`GachaPot`** holds the reward pool and pays winners after a commit-reveal, with a solvency check
  per token. Payouts are bounded by the pot balance at all times.

**Stack.** Frontend on Next.js (App Router) with shadcn and Tailwind v4, wagmi v3 and viem for chain
reads and writes, and **Para** for wallets (embedded MPC plus external connect). Off-chain state on
Cloudflare D1. Contracts built with Foundry and deployed as CREATE2 through the canonical **CreateX**
factory using an Alchemy Agent Wallet session, then verified through the monskills verification API.
The frontend deploys to **Cloudflare Workers** through OpenNext.

**Chain details (Monad testnet):** chain id **10143** (`0x279f`), currency MON, explorer
`testnet.monadexplorer.com`, faucet `faucet.monad.xyz`, test USDC
`0x534b2f3A21130d7a60830c2Df862319e593943A3` (6 decimals).

---

## 7. What ships at the Blitz

**Must-have (the demo):**

- Wallet connect (Para) and a connected board.
- Listing with a real on-chain payment in MON or in testnet USDC (approve plus list).
- The three boards (All-time, Today, Daily) with correct on-chain ranking, and raising your own rank.
- The 50/50 split verified on-chain (pot balance rises, treasury receives its half).
- Share to unlock a daily spin, with commit-reveal and an on-chain payout of a small prize.
- Zonk and super-zonk outcomes, including the share debt that locks the next spin until re-share.
- A dashboard: your listings, your spend, your streak, your spins, your winnings (each with an
  explorer link).
- The gacha inside the user profile, showing the pot, the odds, and the fairness note.

**Nice-to-have:** a streak odds boost, categories and filtering, a delisting admin screen, a
top-slot review queue.

**Roadmap:** mainnet, native USDC, a real price oracle, a hosted leaderboard indexer, and a mobile
client.

The first deploy ships the board, the listing flow, the split, the share loop and the gacha UI on
Cloudflare Workers, with the D1-backed off-chain state running on a local fallback until the database
binding is provisioned.

---

## 8. Non-functional and honesty

- **Testnet and worthless tokens.** Everything runs on Monad testnet. MON and the stablecoin used here
  are test assets with no value. Nothing here is an investment.
- **The gacha is an earned reward, not paid gambling.** Spins are earned by sharing, never sold, and
  the pool is funded by placement revenue. Local gambling and lottery rules still apply and must be
  checked before any real-money launch.
- **Randomness is hackathon-grade.** Commit-reveal, not a hardware VRF. Labelled as such on the page.
- **The MON/USD rate is a demonstration rate.** Ranking normalizes MON to USD with an owner-set rate
  (a real price feed is the mainnet path). Both the rate and its use are stated on the board.
- **Rank is spend, and spend is not quality.** A higher listing is not a better product; it is a
  higher-paying one. The board says this plainly.
- **The share gate is intent-based.** We record that a share action happened; we cannot prove a post
  went live, and we do not pretend to. It is an honest hackathon compromise.
- **Moderation is best-effort.** A blocklist and delisting reduce abuse; they do not guarantee the
  board is clean at any instant.
- **Numbers not yet live are targets, not results.**

---

## 9. Success metrics

North star: **a paid placement that a visitor acts on**, meaning listings created, and clicks through
to listed projects. Supporting metrics: placement revenue (MON and USDC), the gacha pot balance, daily
shares and streaks, and spins per day. Anti-metric: prize value paid out, which should always sit
below funding.

---

## 10. Decisions and open items

**Locked at kickoff:**

| Decision | Choice |
| --- | --- |
| Network scope | Monad testnet only (chain id 10143). No mainnet cut. |
| Placement model | Pay-to-rank leaderboard (not pixels, not fixed banner slots). |
| Tokens | MON and testnet USDC. |
| Revenue split | 50% gacha pot, 50% treasury and operations. |
| Gacha entry | One share per UTC day per wallet, one spin per day. |
| Super zonk | Pays nothing and records a share debt: share again before the next spin. |
| Ranking unit | USD-normalized score, with an owner-set MON rate for the demo. |
| Docs and copy | The PRD and the DESIGN are English; the README is English and Indonesian. |
| Product name | **Supaboard**. |

**Still open:**

1. **Minimum spend and the #1 increment** (the exact numbers).
2. **Prize sizes and weights** for each gacha tier, and the per-wallet daily payout cap.
3. **Listing ownership variant:** keyed-by-URL with an owner (current), versus an open-boost model
   where anyone may add spend to a shared listing.
4. **The MON price feed.** Owner-set demonstration rate for the Blitz versus a Chainlink or Redstone
   feed on testnet.
5. **Streak rewards.** Whether the streak earns an odds boost, bonus spins, or stays cosmetic.
6. **The mascot.** Working name **Bo**; real art and a final name to land.
7. **Off-chain store.** Confirm Cloudflare D1 (needs `D1: Edit` on the deploy token) versus a Supabase
   project.

---

## 11. Revision history

- **v1.1 (24 Oct 2026)**: The gacha moved out of a standalone page and into the user profile, where
  it sits beside the listings and the spin history. Landing copy settled: "Try gacha" replaces the
  earlier chest wording, and the board's key facts (pot, share daily, rank = what you pay) moved into
  an in-board help note. Implementation matches this version.
- **v1.0 (24 Oct 2026)**: First specification, written for Monad Blitz. Supaboard is a pay-to-rank
  billboard on Monad: any project, ad, or link can pay in MON or testnet USDC to stand higher on three
  boards (All-time, Today, Daily). 50% of placement revenue funds a daily share-gacha whose prizes are
  MON, big MON, USDC, big USDC, zonk, and super zonk (which records a share debt). The surface is
  styled after the Duolingo app. Scope is Monad testnet; open decisions sit in §10.
