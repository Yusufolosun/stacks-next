/**
 * @yusufolosun/stacks-next
 *
 * Batteries-included full-stack toolkit for building production-ready
 * Stacks + Clarity dApps with Next.js 14+ App Router.
 *
 * This is the main entry point - exports universal utilities that work
 * on both client and server.
 *
 * @example
 * ```typescript
 * import {
 *   createStacksConfig,
 *   isValidStacksAddress,
 *   stxToMicroStx,
 *   formatStx
 * } from '@yusufolosun/stacks-next';
 *
 * const config = createStacksConfig({ network: 'mainnet' });
 * ```
 *
 * @packageDocumentation
 */

// Core configuration
export {
  createStacksConfig,
  getConfigFromEnv,
  isMainnet,
  isTestnet,
  isDevnet,
} from './core/config';
export type { CreateStacksConfigOptions } from './core/config';

// Core types
export type {
  StacksAddress,
  TxId,
  BlockHeight,
  MicroStx,
  NetworkType,
  PostConditionMode,
  TransactionStatus,
  PostConditionComparison,
  StxPostCondition,
  FungiblePostCondition,
  NonFungiblePostCondition,
  PostCondition,
  TransactionInfo,
  ApiResponse,
  StacksConfig,
  FeeEstimate,
  AccountBalance,
  MempoolTransaction,
  BlockInfo,
  ContractInfo,
  StxTransferPayload,
  ContractCallPayload,
  ContractDeployPayload,
  TransactionOptions,
  UnsignedTransaction,
  SignedTransaction,
  BroadcastResult,
} from './core/types';

// Constants
export {
  MAINNET_URL,
  TESTNET_URL,
  DEVNET_URL,
  NETWORK_URLS,
  DEFAULT_TX_FEE,
  MICRO_STX_PER_STX,
  STX_TOKEN,
  ERROR_CODES,
  PATTERNS,
} from './core/constants';

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
} from './core/errors';

// Address utilities
export {
  isValidStacksAddress,
  isValidContractId,
  isValidTxId,
  assertValidAddress,
  shortenAddress,
  formatAddress,
  getNetworkFromAddress,
  isAddressForNetwork,
  parseContractId,
  createContractId,
} from './core/utils/address';

// Conversion utilities
export {
  stxToMicroStx,
  microStxToStx,
  formatStx,
  formatStxCompact,
  parseStx,
  compareMicroStx,
  addMicroStx,
  subtractMicroStx,
  isZeroMicroStx,
  maxMicroStx,
  minMicroStx,
} from './core/utils/conversion';

// Fee utilities
export {
  validateFee,
  assertValidFee,
  getDefaultFee,
  estimateFee,
  getDefaultFeeEstimate,
  selectFee,
  multiplyFee,
  calculateReplacementFee,
} from './core/utils/fee';
export type { EstimateFeeOptions } from './core/utils/fee';

// BNS utilities
export {
  normalizeBnsLabel,
  isValidBnsName,
  isValidBnsNamespace,
  assertValidBnsName,
  assertValidBnsNamespace,
  parseBnsName,
  createBnsName,
} from './core/utils/bns';

// Memo utilities
export {
  getMemoByteLength,
  isValidMemo,
  assertValidMemo,
  truncateMemo,
} from './core/utils/memo';

// Cache utilities
export { createContractReadCacheKey, createBlockCacheTag } from './core/utils/cache';
export type { ContractReadCacheKeyInput } from './core/utils/cache';

// Post-condition utilities
export {
  createStxPostCondition,
  createFungiblePostCondition,
  createNonFungiblePostCondition,
  toNativePostConditionMode,
  toNativePostCondition,
  toNativePostConditions,
  PostConditionBuilder,
  createPostConditionBuilder,
  pc,
} from './core/utils/postConditions';
export type { PostConditionAsset } from './core/utils/postConditions';
