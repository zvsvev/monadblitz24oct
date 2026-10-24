import { monadTestnet } from "wagmi/chains";
import type { Address } from "viem";

export const CHAIN = monadTestnet;
export const CHAIN_ID = monadTestnet.id; // 10143
export const EXPLORER =
  monadTestnet.blockExplorers?.default.url ?? "https://testnet.monadexplorer.com";

const ZERO = "0x0000000000000000000000000000000000000000";

function addr(value: string | undefined): Address {
  return (value && /^0x[0-9a-fA-F]{40}$/.test(value) ? value : ZERO) as Address;
}

/** Deployed contract addresses, filled in by env after the testnet deploy. */
export const ADDRESSES = {
  board: addr(process.env.NEXT_PUBLIC_SUPABOARD),
  gachaPot: addr(process.env.NEXT_PUBLIC_GACHA_POT),
  /** Monad testnet USDC (6 decimals); verified against the explorer before use. */
  usdc: "0x534b2f3A21130d7a60830c2Df862319e593943A3" as Address,
} as const;

export const isDeployed = ADDRESSES.board !== ZERO;

/** NATIVE sentinel: address(0) means MON in the contracts. */
export const NATIVE = ZERO as Address;

export const listingStructComponents = [
  { name: "owner", type: "address" },
  { name: "createdAt", type: "uint64" },
  { name: "totalUsd", type: "uint256" },
  { name: "url", type: "string" },
  { name: "title", type: "string" },
] as const;

export const boardAbi = [
  {
    type: "function",
    name: "list",
    stateMutability: "payable",
    inputs: [
      { name: "url", type: "string" },
      { name: "title", type: "string" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "listERC20",
    stateMutability: "nonpayable",
    inputs: [
      { name: "url", type: "string" },
      { name: "title", type: "string" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "raise",
    stateMutability: "payable",
    inputs: [{ name: "key", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "raiseERC20",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", type: "bytes32" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "listingKey",
    stateMutability: "pure",
    inputs: [{ name: "url", type: "string" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "listingCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "keyAt",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "getListing",
    stateMutability: "view",
    inputs: [{ name: "key", type: "bytes32" }],
    outputs: [{ name: "", type: "tuple", components: listingStructComponents }],
  },
  {
    type: "function",
    name: "totalUsdOf",
    stateMutability: "view",
    inputs: [{ name: "key", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "dayUsd",
    stateMutability: "view",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "uint64" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "currentDay",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
  },
  {
    type: "function",
    name: "topKey",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "topUsd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "gachaBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint16" }],
  },
  {
    type: "function",
    name: "minSpendUsd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "minIncrementUsd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "monUsdRate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Listed",
    inputs: [
      { name: "key", type: "bytes32", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "usd", type: "uint256", indexed: false },
      { name: "url", type: "string", indexed: false },
      { name: "title", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Raised",
    inputs: [
      { name: "key", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "usd", type: "uint256", indexed: false },
    ],
  },
] as const;

export const potAbi = [
  {
    type: "function",
    name: "potBalance",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "commitmentOf",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "commitSpin",
    stateMutability: "nonpayable",
    inputs: [
      { name: "player", type: "address" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revealSpin",
    stateMutability: "nonpayable",
    inputs: [
      { name: "player", type: "address" },
      { name: "tier", type: "uint8" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "token", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "Paid",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "tier", type: "uint8", indexed: false },
    ],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
