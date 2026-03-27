/**
 * Core module index
 *
 * Re-exports all core functionality including config, types, constants, errors, and utilities.
 */

// Config
export {
  createStacksConfig,
  getConfigFromEnv,
  isMainnet,
  isTestnet,
  isDevnet,
} from './config';
export type { CreateStacksConfigOptions } from './config';

// Types
export type * from './types';

// Constants
export {
  MAINNET_URL,
  TESTNET_URL,
  DEVNET_URL,
  NETWORK_URLS,
  DEFAULT_TX_FEE,
  MICRO_STX_PER_STX,
  DEFAULT_ANCHOR_MODE,
  DEFAULT_POST_CONDITION_MODE,
  DEFAULT_CLARITY_VERSION,
  MAX_TX_FEE,
  MIN_TX_FEE,
  DEFAULT_API_TIMEOUT,
  BLOCK_CACHE_TTL,
  STACKS_BLOCK_TIME,
  CONTRACT_ADDRESS_LENGTH,
  STANDARD_ADDRESS_LENGTH,
  MEMO_MAX_LENGTH,
  BNS_NAMESPACE_MIN_LENGTH,
  BNS_NAMESPACE_MAX_LENGTH,
  BNS_NAME_MIN_LENGTH,
  BNS_NAME_MAX_LENGTH,
  CONTRACT_NAME_MIN_LENGTH,
  CONTRACT_NAME_MAX_LENGTH,
  MAINNET_CHAIN_ID,
  TESTNET_CHAIN_ID,
  ADDRESS_VERSION_MAINNET_SINGLE_SIG,
  ADDRESS_VERSION_MAINNET_MULTI_SIG,
  ADDRESS_VERSION_TESTNET_SINGLE_SIG,
  ADDRESS_VERSION_TESTNET_MULTI_SIG,
  STX_TOKEN,
  ERROR_CODES,
  PATTERNS,
} from './constants';

// Errors
export {
  StacksNextError,
  InvalidAddressError,
  InvalidNetworkError,
  InvalidAmountError,
  InvalidFeeError,
  InvalidNonceError,
  InvalidContractError,
  InvalidFunctionError,
  InvalidBnsNameError,
  InvalidBnsNamespaceError,
  InvalidMemoError,
  TransactionFailedError,
  BroadcastFailedError,
  SignatureVerificationError,
  UnauthorizedError,
  NotFoundError,
  ApiError,
  NetworkError,
} from './errors';

// Utilities
export * from './utils';
