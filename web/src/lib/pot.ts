import {
  bytesToHex,
  createWalletClient,
  encodeAbiParameters,
  http,
  keccak256,
  parseAbiParameters,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "wagmi/chains";
import { type GachaOutcome, tierIdFor } from "./gacha";
import { ADDRESSES, NATIVE, potAbi } from "./contracts";

const RPC = "https://testnet-rpc.monad.xyz";

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

/**
 * Maps a draw to the (tier, amount, token) the pot pays. Everything is USDC; zonk and super zonk
 * pay nothing. Returns null when there is nothing to pay.
 */
export function payoutFor(
  outcome: GachaOutcome,
): { tier: number; amount: bigint; token: Address } | null {
  if (outcome.amount <= 0) return null;
  return {
    tier: tierIdFor(outcome.tier),
    amount: parseUnits(outcome.amount.toString(), 6),
    token: ADDRESSES.usdc,
  };
}

/**
 * Commit then reveal a spin through the pot, so the payout is a verifiable on-chain event. Returns
 * the two transaction hashes, or null when the payer is not configured.
 */
export async function runOnChainSpin(
  player: Address,
  outcome: GachaOutcome,
): Promise<string[] | null> {
  const client = payerClient();
  if (!client) return null;

  const payout = payoutFor(outcome) ?? { tier: 0, amount: 0n, token: ADDRESSES.usdc };

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
