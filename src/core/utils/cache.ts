/**
 * Deterministic cache-key helpers for read-only Stacks contract calls.
 */

import {
  InvalidAddressError,
  InvalidContractError,
  InvalidFunctionError,
} from "../errors";
import type { NetworkType } from "../types";
import { isValidContractId, isValidStacksAddress } from "./address";

export interface ContractReadCacheKeyInput {
  network: NetworkType;
  contractId: string;
  functionName: string;
  args?: readonly unknown[];
  sender?: string;
  blockHeight?: number;
  includeBlockHeight?: boolean;
}

function stableSerialize(value: unknown): string {
  if (typeof value === "bigint") {
    return `bigint:${value.toString()}`;
  }

  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );

  return `{${entries
    .map(([key, child]) => `${JSON.stringify(key)}:${stableSerialize(child)}`)
    .join(",")}}`;
}

/**
 * Creates a stable cache key for read-only contract calls.
 */
export function createContractReadCacheKey(
  input: ContractReadCacheKeyInput,
): string {
  const {
    network,
    contractId,
    functionName,
    args = [],
    sender,
    blockHeight,
    includeBlockHeight = true,
  } = input;

  if (!isValidContractId(contractId)) {
    throw new InvalidContractError(contractId);
  }

  if (!functionName || typeof functionName !== "string") {
    throw new InvalidFunctionError(functionName);
  }

  if (sender && !isValidStacksAddress(sender)) {
    throw new InvalidAddressError(sender);
  }

  const normalizedBlockHeight =
    includeBlockHeight &&
    Number.isInteger(blockHeight) &&
    (blockHeight ?? -1) >= 0
      ? String(blockHeight)
      : "latest";

  return [
    "stacks-next",
    "contract-read",
    network,
    contractId,
    functionName,
    sender ?? "anonymous",
    includeBlockHeight ? normalizedBlockHeight : "any-block",
    stableSerialize(args),
  ].join("|");
}

/**
 * Creates a tag string for invalidating block-aware cache groups.
 */
export function createBlockCacheTag(
  network: NetworkType,
  blockHeight: number | "latest",
): string {
  const normalized =
    blockHeight === "latest" ||
    (Number.isInteger(blockHeight) && blockHeight >= 0)
      ? String(blockHeight)
      : "latest";

  return `stacks-next:block:${network}:${normalized}`;
}
