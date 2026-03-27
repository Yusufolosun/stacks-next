/**
 * Constants and default values for @yusufolosun/stacks-next
 */

import type { NetworkType } from "./types";

/**
 * Default Hiro API URLs for each network
 */
export const MAINNET_URL = "https://api.mainnet.hiro.so";
export const TESTNET_URL = "https://api.testnet.hiro.so";
export const DEVNET_URL = "http://localhost:3999";

/**
 * Network URL mapping
 */
export const NETWORK_URLS: Record<NetworkType, string> = {
  mainnet: MAINNET_URL,
  testnet: TESTNET_URL,
  devnet: DEVNET_URL,
};

/**
 * Default transaction fee in microSTX
 * 0.001 STX = 1,000 microSTX
 */
export const DEFAULT_TX_FEE = BigInt(1000);

/**
 * STX to microSTX conversion factor
 */
export const MICRO_STX_PER_STX = BigInt(1_000_000);

/**
 * Default anchor mode for transactions
 */
export const DEFAULT_ANCHOR_MODE = "any" as const;

/**
 * Default post-condition mode
 */
export const DEFAULT_POST_CONDITION_MODE = "deny" as const;

/**
 * Clarity version
 */
export const DEFAULT_CLARITY_VERSION = 2;

/**
 * Maximum allowed fee in microSTX (1 STX)
 */
export const MAX_TX_FEE = BigInt(1_000_000);

/**
 * Minimum allowed fee in microSTX
 */
export const MIN_TX_FEE = BigInt(180);

/**
 * Default timeout for API requests in milliseconds
 */
export const DEFAULT_API_TIMEOUT = 30_000;

/**
 * Cache TTL for block-aware caching (in seconds)
 */
export const BLOCK_CACHE_TTL = 600; // 10 minutes

/**
 * Stacks block time in seconds (approximate)
 */
export const STACKS_BLOCK_TIME = 600; // 10 minutes

/**
 * Contract address length
 */
export const CONTRACT_ADDRESS_LENGTH = 41;

/**
 * Standard principal address length
 */
export const STANDARD_ADDRESS_LENGTH = 41;

/**
 * Transaction memo max length
 */
export const MEMO_MAX_LENGTH = 34;

/**
 * BNS namespace lengths
 */
export const BNS_NAMESPACE_MIN_LENGTH = 1;
export const BNS_NAMESPACE_MAX_LENGTH = 20;

/**
 * BNS name lengths
 */
export const BNS_NAME_MIN_LENGTH = 1;
export const BNS_NAME_MAX_LENGTH = 48;

/**
 * Contract name constraints
 */
export const CONTRACT_NAME_MIN_LENGTH = 1;
export const CONTRACT_NAME_MAX_LENGTH = 128;

/**
 * Mainnet chain ID
 */
export const MAINNET_CHAIN_ID = 0x00000001;

/**
 * Testnet chain ID
 */
export const TESTNET_CHAIN_ID = 0x80000000;

/**
 * Address versions
 */
export const ADDRESS_VERSION_MAINNET_SINGLE_SIG = 22;
export const ADDRESS_VERSION_MAINNET_MULTI_SIG = 20;
export const ADDRESS_VERSION_TESTNET_SINGLE_SIG = 26;
export const ADDRESS_VERSION_TESTNET_MULTI_SIG = 21;

/**
 * STX token info
 */
export const STX_TOKEN = {
  name: "Stacks",
  symbol: "STX",
  decimals: 6,
};

/**
 * Error codes
 */
export const ERROR_CODES = {
  INVALID_ADDRESS: "INVALID_ADDRESS",
  INVALID_NETWORK: "INVALID_NETWORK",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  INVALID_FEE: "INVALID_FEE",
  INVALID_NONCE: "INVALID_NONCE",
  INVALID_CONTRACT: "INVALID_CONTRACT",
  INVALID_FUNCTION: "INVALID_FUNCTION",
  INVALID_BNS_NAME: "INVALID_BNS_NAME",
  INVALID_BNS_NAMESPACE: "INVALID_BNS_NAMESPACE",
  INVALID_MEMO: "INVALID_MEMO",
  TRANSACTION_FAILED: "TRANSACTION_FAILED",
  BROADCAST_FAILED: "BROADCAST_FAILED",
  SIGNATURE_VERIFICATION_FAILED: "SIGNATURE_VERIFICATION_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  API_ERROR: "API_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

/**
 * Regex patterns
 */
export const PATTERNS = {
  STACKS_ADDRESS: /^S[TPMNC][1-9A-HJ-NP-Z]{38,40}$/,
  CONTRACT_ID:
    /^S[TPMNC][1-9A-HJ-NP-Z]{38,40}\.[a-zA-Z]([a-zA-Z0-9]|[-_]){0,39}$/,
  TX_ID: /^0x[0-9a-fA-F]{64}$/,
  BNS_NAME: /^[a-z0-9]([a-z0-9-]{0,36}[a-z0-9])?$/,
  BNS_NAMESPACE: /^[a-z0-9-]{1,20}$/,
} as const;
