/**
 * Core utilities index
 *
 * Re-exports all utility functions for convenient importing.
 */

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
} from "./address";

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
} from "./conversion";

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
} from "./fee";
export type { EstimateFeeOptions } from "./fee";

// BNS utilities
export {
  normalizeBnsLabel,
  isValidBnsName,
  isValidBnsNamespace,
  assertValidBnsName,
  assertValidBnsNamespace,
  parseBnsName,
  createBnsName,
} from "./bns";

// Memo utilities
export {
  getMemoByteLength,
  isValidMemo,
  assertValidMemo,
  truncateMemo,
} from "./memo";

// Cache utilities
export { createContractReadCacheKey, createBlockCacheTag } from "./cache";
export type { ContractReadCacheKeyInput } from "./cache";

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
} from "./postConditions";
export type { PostConditionAsset } from "./postConditions";
