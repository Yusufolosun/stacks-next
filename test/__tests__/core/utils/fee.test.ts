/**
 * Tests for fee utilities
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStacksConfig } from '../../../../src/core/config';
import {
  validateFee,
  estimateFee,
  getDefaultFeeEstimate,
  selectFee,
  multiplyFee,
  calculateReplacementFee,
} from '../../../../src/core/utils/fee';
import { InvalidFeeError } from '../../../../src/core/errors';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('validateFee', () => {
  it('accepts valid fee', () => {
    expect(() => validateFee(1000n)).not.toThrow();
  });

  it('throws for invalid fee ranges', () => {
    expect(() => validateFee(100n)).toThrow(InvalidFeeError);
    expect(() => validateFee(2_000_000n)).toThrow(InvalidFeeError);
  });
});

describe('estimateFee', () => {
  const config = createStacksConfig({ network: 'testnet' });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses tx payload endpoint when payload is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse({
        estimations: [{ fee: 180 }, { fee: 500 }, { fee: 1000 }],
      })
    );

    const fee = await estimateFee(config, { txPayload: '0xdeadbeef' });

    expect(fee).toEqual({ low: 180n, medium: 500n, high: 1000n });
  });

  it('falls back to transfer endpoint when payload response is malformed', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ nope: true }))
      .mockResolvedValueOnce(jsonResponse(2));

    const fee = await estimateFee(config, {
      txPayload: '0xdeadbeef',
      estimatedSize: 100,
    });

    expect(fee.low).toBe(200n);
    expect(fee.medium).toBe(250n);
    expect(fee.high).toBe(300n);
  });

  it('returns default estimate for invalid fee-rate responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({ foo: 'bar' }));

    const fee = await estimateFee(config);

    expect(fee).toEqual(getDefaultFeeEstimate());
  });

  it('returns default estimate on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network down'));

    const fee = await estimateFee(config);

    expect(fee).toEqual(getDefaultFeeEstimate());
  });
});

describe('fee helpers', () => {
  it('selects fee by priority', () => {
    const estimate = { low: 1n, medium: 2n, high: 3n };
    expect(selectFee(estimate, 'low')).toBe(1n);
    expect(selectFee(estimate, 'medium')).toBe(2n);
    expect(selectFee(estimate, 'high')).toBe(3n);
  });

  it('multiplies and caps fees', () => {
    expect(multiplyFee(1000n, 1.5)).toBe(1500n);
    expect(multiplyFee(1_000_000n, 2)).toBe(1_000_000n);
    expect(() => multiplyFee(1000n, 0)).toThrow(InvalidFeeError);
  });

  it('calculates replacement fee', () => {
    expect(calculateReplacementFee(1000n)).toBe(1250n);
  });
});
