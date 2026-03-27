/**
 * Tests for cache utilities
 */

import { describe, expect, it } from 'vitest';
import {
  createContractReadCacheKey,
  createBlockCacheTag,
} from '../../../../src/core/utils/cache';
import {
  InvalidAddressError,
  InvalidContractError,
  InvalidFunctionError,
} from '../../../../src/core/errors';

const VALID_ADDRESS = 'SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4';
const VALID_CONTRACT = `${VALID_ADDRESS}.my-contract`;

describe('createContractReadCacheKey', () => {
  it('builds deterministic cache keys', () => {
    const keyA = createContractReadCacheKey({
      network: 'mainnet',
      contractId: VALID_CONTRACT,
      functionName: 'get-balance',
      args: [{ b: 2, a: 1 }, [3, 2, 1], 42n],
      sender: VALID_ADDRESS,
      blockHeight: 100,
    });

    const keyB = createContractReadCacheKey({
      network: 'mainnet',
      contractId: VALID_CONTRACT,
      functionName: 'get-balance',
      args: [{ a: 1, b: 2 }, [3, 2, 1], 42n],
      sender: VALID_ADDRESS,
      blockHeight: 100,
    });

    expect(keyA).toBe(keyB);
  });

  it('supports non-block-aware mode', () => {
    const key = createContractReadCacheKey({
      network: 'testnet',
      contractId: VALID_CONTRACT,
      functionName: 'get-price',
      args: [],
      includeBlockHeight: false,
    });

    expect(key).toContain('any-block');
  });

  it('throws for invalid inputs', () => {
    expect(() =>
      createContractReadCacheKey({
        network: 'mainnet',
        contractId: 'invalid',
        functionName: 'fn',
      })
    ).toThrow(InvalidContractError);

    expect(() =>
      createContractReadCacheKey({
        network: 'mainnet',
        contractId: VALID_CONTRACT,
        functionName: '',
      })
    ).toThrow(InvalidFunctionError);

    expect(() =>
      createContractReadCacheKey({
        network: 'mainnet',
        contractId: VALID_CONTRACT,
        functionName: 'fn',
        sender: 'invalid-sender',
      })
    ).toThrow(InvalidAddressError);
  });
});

describe('createBlockCacheTag', () => {
  it('creates block tags for exact heights and latest', () => {
    expect(createBlockCacheTag('mainnet', 10)).toBe('stacks-next:block:mainnet:10');
    expect(createBlockCacheTag('testnet', 'latest')).toBe(
      'stacks-next:block:testnet:latest'
    );
  });

  it('falls back to latest for invalid heights', () => {
    expect(createBlockCacheTag('devnet', -1)).toBe('stacks-next:block:devnet:latest');
  });
});
