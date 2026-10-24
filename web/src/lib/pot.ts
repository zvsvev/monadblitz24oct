import {
  bytesToHex,
  createWalletClient,
  encodeAbiParameters,
  http,
  keccak256,
  parseAbiParameters,
  parseEther,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "wagmi/chains";
import type { DemoOutcome } from "./demo";
import { ADDRESSES, NATIVE, potAbi } from "./contracts";

const RPC = "https://testnet-rpc.monad.xyz";

/** On-chain tier ids, matching GachaPot's constants. */
const TIER_IDS: Record<string, number> = {
  zonk: 0,
  mon: 1,
  "big-mon": 2,
  usdc: 3,
  "big-usdc": 4,
};

function payerClient() {
  const pk = process.env.PAYER_PRIVATE_KEY;
  if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) return null;
  return createWalletClient({
    account: privateKeyToAccount(pk as Hex),
    chain: monadTestnet,
    transport: http(RPC),
  });
}

export function onChainConfigured(): boolean {
  return !!payerClient() && ADDRESSES.gachaPot !== NATIVE;
}

/** Maps a draw to the (tier, amount, token) triple the pot pays. Zonk and super zonk pay nothing. */
export function payoutFor(outcome: DemoOutcome): { tier: number; amount: bigint; token: Address } | null {
  switch (outcome.tier) {
    case "mon":
      return { tier: TIER_IDS.mon, amount: parseEther("0.5"), token: NATIVE };
    case "big-mon":
      return { tier: TIER_IDS["big-mon"], amount: parseEther("10"), token: NATIVE };
    case "usdc":
      return { tier: TIER_IDS.usdc, amount: parseUnits("2", 6), token: ADDRESSES.usdc };
    case "big-usdc":
      return { tier: TIER_IDS["big-usdc"], amount: parseUnits("25", 6), token: ADDRESSES.usdc };
    default:
      return null;
  }
}

/**
 * Commit then reveal a spin through the pot, so the payout is a verifiable on-chain event. Returns
 * the two transaction hashes, or null when the payer is not configured.
 */
export async function runOnChainSpin(
  player: Address,
  outcome: DemoOutcome,
): Promise<string[] | null> {
  const client = payerClient();
  if (!client) return null;

  const payout = payoutFor(outcome) ?? { tier: TIER_IDS.zonk, amount: 0n, token: NATIVE };

  const nonceBytes = new Uint8Array(32);
  crypto.getRandomValues(nonceBytes);
  const nonce = bytesToHex(nonceBytes);

  const commitment = keccak256(
    encodeAbiParameters(parseAbiParameters("address,uint8,uint256,bytes32"), [
      player,
      payout.tier,
      payout.amount,
      nonce,
    ]),
  );

  const commitHash = await client.writeContract({
    address: ADDRESSES.gachaPot,
    abi: potAbi,
    functionName: "commitSpin",
    args: [player, commitment],
  });

  const revealHash = await client.writeContract({
    address: ADDRESSES.gachaPot,
    abi: potAbi,
    functionName: "revealSpin",
    args: [player, payout.tier, payout.amount, nonce, payout.token],
  });

  return [commitHash, revealHash];
}
