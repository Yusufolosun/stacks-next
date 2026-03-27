/**
 * Memo utilities for STX transactions.
 */

import { MEMO_MAX_LENGTH } from "../constants";
import { InvalidMemoError } from "../errors";

const textEncoder = new TextEncoder();

/**
 * Returns the UTF-8 byte length of a memo.
 */
export function getMemoByteLength(memo: string): number {
  if (typeof memo !== "string") {
    return 0;
  }

  return textEncoder.encode(memo).length;
}

/**
 * Validates a transaction memo against max byte length.
 */
export function isValidMemo(memo: string, maxBytes = MEMO_MAX_LENGTH): boolean {
  if (typeof memo !== "string") {
    return false;
  }

  if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
    return false;
  }

  return getMemoByteLength(memo) <= maxBytes;
}

/**
 * Asserts that a memo is valid.
 */
export function assertValidMemo(
  memo: string,
  maxBytes = MEMO_MAX_LENGTH,
): asserts memo is string {
  if (!isValidMemo(memo, maxBytes)) {
    throw new InvalidMemoError(
      memo,
      `Memo must be a UTF-8 string with at most ${maxBytes} bytes`,
    );
  }
}

/**
 * Truncates a memo to a max UTF-8 byte length without splitting code points.
 */
export function truncateMemo(memo: string, maxBytes = MEMO_MAX_LENGTH): string {
  if (typeof memo !== "string") {
    throw new InvalidMemoError(String(memo), "Memo must be a string");
  }

  if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
    throw new InvalidMemoError(memo, "maxBytes must be a positive integer");
  }

  if (getMemoByteLength(memo) <= maxBytes) {
    return memo;
  }

  let output = "";

  for (const character of memo) {
    const candidate = `${output}${character}`;
    if (getMemoByteLength(candidate) > maxBytes) {
      break;
    }
    output = candidate;
  }

  return output;
}
