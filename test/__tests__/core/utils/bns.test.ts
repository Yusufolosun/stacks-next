/**
 * Tests for BNS utilities
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeBnsLabel,
  isValidBnsName,
  isValidBnsNamespace,
  assertValidBnsName,
  assertValidBnsNamespace,
  parseBnsName,
  createBnsName,
} from '../../../../src/core/utils/bns';
import {
  InvalidBnsNameError,
  InvalidBnsNamespaceError,
} from '../../../../src/core/errors';

describe('normalizeBnsLabel', () => {
  it('normalizes whitespace and casing', () => {
    expect(normalizeBnsLabel('  Satoshi-Name  ')).toBe('satoshi-name');
  });
});

describe('isValidBnsName', () => {
  it('accepts valid names', () => {
    expect(isValidBnsName('satoshi')).toBe(true);
    expect(isValidBnsName('my-name-123')).toBe(true);
  });

  it('rejects invalid names', () => {
    expect(isValidBnsName('')).toBe(false);
    expect(isValidBnsName('-bad')).toBe(false);
    expect(isValidBnsName('bad-')).toBe(false);
    expect(isValidBnsName('bad name')).toBe(false);
  });

  it('accepts uppercase input by normalizing to lowercase', () => {
    expect(isValidBnsName('UPPER')).toBe(true);
  });
});

describe('isValidBnsNamespace', () => {
  it('accepts valid namespaces', () => {
    expect(isValidBnsNamespace('btc')).toBe(true);
    expect(isValidBnsNamespace('my-namespace')).toBe(true);
  });

  it('rejects invalid namespaces', () => {
    expect(isValidBnsNamespace('')).toBe(false);
    expect(isValidBnsNamespace('name space')).toBe(false);
    expect(isValidBnsNamespace('too_long_namespace_name_123')).toBe(false);
  });
});

describe('assertions', () => {
  it('throws for invalid labels', () => {
    expect(() => assertValidBnsName('invalid name')).toThrow(InvalidBnsNameError);
    expect(() => assertValidBnsNamespace('namespace with space')).toThrow(
      InvalidBnsNamespaceError
    );
  });
});

describe('parseBnsName', () => {
  it('parses normalized FQNs', () => {
    expect(parseBnsName('Satoshi.BTC')).toEqual({
      name: 'satoshi',
      namespace: 'btc',
    });
  });

  it('returns null for invalid FQNs', () => {
    expect(parseBnsName('invalid')).toBeNull();
    expect(parseBnsName('too.many.parts')).toBeNull();
  });
});

describe('createBnsName', () => {
  it('creates normalized FQNs', () => {
    expect(createBnsName('  satoshi ', ' BTC ')).toBe('satoshi.btc');
  });

  it('throws for invalid labels', () => {
    expect(() => createBnsName('bad name', 'btc')).toThrow(InvalidBnsNameError);
    expect(() => createBnsName('satoshi', 'bad namespace')).toThrow(
      InvalidBnsNamespaceError
    );
  });
});
