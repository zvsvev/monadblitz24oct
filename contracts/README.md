# BuzzMe contracts

Two contracts, built with [Foundry](https://book.getfoundry.sh/):

- **`BuzzMe.sol`** — the pay-to-rank billboard. Accepts native MON and ERC-20 (testnet USDC),
  records a USD-normalized rank per listing (cumulative plus a per-UTC-day bucket), enforces the
  minimum spend and the #1 minimum-increment rule, and splits every payment 50% to the gacha pot,
  50% to treasury.
- **`GachaPot.sol`** — the reward pot. A role-gated `payer` commits to a spin and then reveals it;
  payouts are bounded by the pot balance per token.

## Commands

```bash
forge build
forge test
forge fmt
```

## Deploy

The Blitz deploy goes through an Alchemy Agent Wallet session as CREATE2 through the canonical
CreateX factory (`0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed`); see the monskills `wallet` skill.
`script/Deploy.s.sol` documents the constructor wiring and is the local fallback:

```bash
OWNER=0x.. TREASURY=0x.. PAYER=0x.. \
  forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast
```

After deploying, verify on all explorers with the monskills verification API
(`POST https://agents.devnads.com/v1/verify`, `chainId` 10143).

## Monad notes

Monad charges gas on the **gas limit**, not the gas used, so keep limits tight. A native transfer is
always 21000 gas.
