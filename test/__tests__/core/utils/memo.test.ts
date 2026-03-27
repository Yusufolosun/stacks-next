/**
 * Tests for memo utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getMemoByteLength,
  isValidMemo,
  assertValidMemo,
  truncateMemo,
} from '../../../../src/core/utils/memo';
import { InvalidMemoError } from '../../../../src/core/errors';

describe('getMemoByteLength', () => {
  it('returns byte length for ascii and utf8', () => {
    expect(getMemoByteLength('hello')).toBe(5);
    expect(getMemoByteLength('hello🙂')).toBeGreaterThan(5);
  });
});

describe('isValidMemo', () => {
  it('validates memo byte limits', () => {
    expect(isValidMemo('a'.repeat(34))).toBe(true);
    expect(isValidMemo('a'.repeat(35))).toBe(false);
  });

  it('rejects invalid maxBytes values', () => {
    expect(isValidMemo('abc', 0)).toBe(false);
    expect(isValidMemo('abc', -1)).toBe(false);
  });
});

describe('assertValidMemo', () => {
  it('throws when memo exceeds limit', () => {
    expect(() => assertValidMemo('x'.repeat(35))).toThrow(InvalidMemoError);
  });
});

describe('truncateMemo', () => {
  it('truncates utf8-safe to byte limit', () => {
    const memo = '123456789012345678901234567890🙂🙂';
    const truncated = truncateMemo(memo, 34);

    expect(getMemoByteLength(truncated)).toBeLessThanOrEqual(34);
    expect(truncated.startsWith('1234567890')).toBe(true);
  });

  it('throws for invalid input', () => {
    expect(() => truncateMemo('ok', 0)).toThrow(InvalidMemoError);
  });
});
