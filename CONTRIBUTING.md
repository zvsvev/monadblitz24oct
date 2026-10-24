# Contributing to Supaboard (monadblitz24oct)

## Layout

```text
contracts/    Foundry: Supaboard (pay-to-rank), GachaPot (+ tests, script/Deploy.s.sol)
web/          Next.js App Router + shadcn + wagmi + Para; D1 for off-chain state
web/d1/       schema.sql: listings metadata, shares, spins
indexer/      Envio HyperIndex for the placement, payout and share activity feed (after deploy)
skills/       MONSKILLS (the tooling these conventions follow)
```

## Prerequisites

- Node 18+ and Foundry (`forge`, `cast`, `anvil`).
- For the deploy and the frontend: `@alchemy/cli` (agent wallet), `@getpara/cli` (wallets),
  `envio-cloud` + `gh` (indexer).

## Contracts

```bash
cd contracts
forge build
forge test
```

Deployment follows the monskills `wallet` skill: contract creation bytecode is deployed as **CREATE2
through the canonical CreateX factory** (`0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`) via an Alchemy
Agent Wallet session. Do not deploy with a raw private key. After deploying, verify with the
monskills verification API (`POST https://agents.devnads.com/v1/verify`, `chainId` 10143).

Monad charges gas on the **gas limit**, not the gas used, so keep limits tight. The `Supaboard`
contract splits every payment 50% to `GachaPot` and 50% to the treasury; `GachaPot` pays winners after
a commit-reveal, bounded by the pot balance per token.

## Web

```bash
cd web
cp .env.local.example .env.local   # Para key, D1 binding, deployed addresses
npm install
npm run dev
```

Then `npx shadcn@latest ...`, `para doctor`, and the usual Next.js flows. The wallet layer is **Para**
(embedded MPC plus external wallets) with **Monad testnet** as the default chain (see
`src/app/providers.tsx`). Off-chain state (listing metadata, shares, spins) runs on Cloudflare **D1**;
with no binding present the app falls back to a local, single-browser demo store.

Server-only routes under `src/app/api/*` hold the gacha `PAYER_PRIVATE_KEY` used to record shares and to
commit and reveal spins.

## Database

Apply `web/d1/schema.sql` to the D1 database (or let the local fallback run with no database). It
creates `listings_meta`, `shares` and `spins`, with an index on the daily share window and the spin log.

## Deploy (Cloudflare Workers)

The frontend deploys to Cloudflare Workers through **OpenNext** (`@opennextjs/cloudflare`) on the
`M31.ulinnuha@gmail.com` account (worker `supaboard`).

```bash
cd web
bash -c 'source ~/.cloudflare/load-cf.sh FISHEE; npm run deploy'
```

`npm run deploy` builds the Next.js app, transforms it with OpenNext, and deploys with Wrangler. Do
**not** enable Next.js `cacheComponents`: the Workers runtime's `setTimeout()` implementation makes it
hang (error 1101). Runtime secrets for the Worker (the Para key, the D1 binding, `PAYER_PRIVATE_KEY`)
go in as Wrangler secrets. Do not attach a custom domain; the worker stays on `*.workers.dev`.

## Provenance

This project was built with **MONSKILLS**. `.monskills` records the target network; see
[`skills/`](./skills) for the installed skills.
