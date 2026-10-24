# BuzzMe contracts

Two contracts, built with [Foundry](https://book.getfoundry.sh/):

- **`BuzzMe.sol`** — the pay-to-rank billboard. Paid in **testnet USDC only** (the token is fixed in
  `usdc`; MON is gas only), records a USDC rank per listing (cumulative plus a per-UTC-day bucket),
  enforces the 10 USDC minimum spend and the 5 USDC #1 minimum-increment rule, and splits every
  payment 50% to the gacha pot, 50% to treasury.
- **`GachaPot.sol`** — the reward pot. A role-gated `payer` commits to a spin and then reveals it;
  payouts are USDC, bounded by the pot balance, and the prize ladder is readable on-chain through
  `tierAmount` (100 / 50 / 10 / 1 / 0.05 / 0.01 USDC, then zonk).

## Deployed (Monad testnet, chain id 10143)

| Contract | Address |
| --- | --- |
| `BuzzMe` | `0xc19916ce2fb831eeabe0b29fe985792d9b9e7524` |
| `GachaPot` | `0x52476c27b16718f0da118dbe714db7a2651626be` |
| USDC (settlement token) | `0x534b2f3A21130d7a60830c2Df862319e593943A3` |

Owner, treasury and `payer` are all the deployer, `0x8212cF3a8235d84F350CC9A4De01fE64701DeE8a`.

## Commands

```bash
forge build
forge test
forge fmt
```

## Deploy

The Blitz deploy can go through an Alchemy Agent Wallet session as CREATE2 through the canonical
CreateX factory (`0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`); see the monskills `wallet` skill.
`script/Deploy.s.sol` documents the constructor wiring and is also the direct path:

```bash
OWNER=0x.. TREASURY=0x.. PAYER=0x.. USDC=0x534b2f3A21130d7a60830c2Df862319e593943A3 \
  forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

After deploying, verify on all explorers with the monskills verification API
(`POST https://agents.devnads.com/v1/verify`, `chainId` 10143).

## Monad notes

Monad charges gas on the **gas limit**, not the gas used, so keep limits tight. A native transfer is
always 21000 gas.
