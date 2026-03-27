/**
 * Fee estimation and validation utilities
 */

import {
  DEFAULT_TX_FEE,
  MIN_TX_FEE,
  MAX_TX_FEE,
  DEFAULT_API_TIMEOUT,
} from '../constants';
import { InvalidFeeError, ApiError } from '../errors';
import type { MicroStx, FeeEstimate, StacksConfig } from '../types';

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function toFeeAmount(value: unknown, fallback: MicroStx): MicroStx {
  const parsed = toFiniteNumber(value);

  if (parsed === null || parsed < 0) {
    return fallback;
  }

  return BigInt(Math.ceil(parsed));
}

function toEstimatedSize(value: unknown, fallback = 300): number {
  const parsed = toFiniteNumber(value);

  if (parsed === null || parsed <= 0) {
    return fallback;
  }

  return Math.max(1, Math.floor(parsed));
}

/**
 * Options for fee estimation
 */
export interface EstimateFeeOptions {
  /**
   * Serialized transaction (hex string)
   */
  txPayload?: string;

  /**
   * Estimated transaction byte size
   */
  estimatedSize?: number;

  /**
   * Timeout for the API request
   */
  timeout?: number;
}

/**
 * Validates a fee amount
 *
 * @param fee - The fee to validate
 * @param options - Validation options
 * @throws InvalidFeeError if the fee is invalid
 *
 * @example
 * ```typescript
 * validateFee(1000n); // passes
 * validateFee(0n); // throws InvalidFeeError
 * validateFee(10000000000n); // throws InvalidFeeError (too high)
 * ```
 */
export function validateFee(
  fee: MicroStx,
  options: {
    minFee?: MicroStx;
    maxFee?: MicroStx;
  } = {}
): void {
  const { minFee = MIN_TX_FEE, maxFee = MAX_TX_FEE } = options;

  if (fee < minFee) {
    throw new InvalidFeeError(fee, `Fee must be at least ${minFee} microSTX`);
  }

  if (fee > maxFee) {
    throw new InvalidFeeError(fee, `Fee must be at most ${maxFee} microSTX`);
  }
}

/**
 * Asserts that a fee is valid
 *
 * @param fee - The fee to validate
 * @throws InvalidFeeError if the fee is invalid
 */
export function assertValidFee(fee: MicroStx): asserts fee is MicroStx {
  validateFee(fee);
}

/**
 * Gets the default transaction fee
 *
 * @returns Default fee in microSTX
 */
export function getDefaultFee(): MicroStx {
  return DEFAULT_TX_FEE;
}

/**
 * Estimates transaction fee by calling the Stacks API
 *
 * @param config - Stacks configuration
 * @param options - Estimation options
 * @returns Fee estimate with low, medium, and high values
 *
 * @example
 * ```typescript
 * const estimate = await estimateFee(config, {
 *   estimatedSize: 300
 * });
 * console.log(estimate.medium); // Recommended fee
 * ```
 */
export async function estimateFee(
  config: StacksConfig,
  options: EstimateFeeOptions = {}
): Promise<FeeEstimate> {
  const { txPayload, estimatedSize = 300, timeout = DEFAULT_API_TIMEOUT } = options;
  const safeEstimatedSize = toEstimatedSize(estimatedSize);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // If we have a transaction payload, use POST to get exact fee estimation
    if (txPayload) {
      const response = await fetch(
        `${config.apiUrl}/v2/fees/transaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_payload: txPayload,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new ApiError(
          `Fee estimation failed: ${response.statusText}`,
          response.status,
          `${config.apiUrl}/v2/fees/transaction`
        );
      }

      const data: unknown = await response.json();

      if (
        typeof data === 'object' &&
        data !== null &&
        'estimations' in data &&
        Array.isArray((data as { estimations: unknown[] }).estimations)
      ) {
        const estimations = (data as { estimations: Array<{ fee?: unknown }> }).estimations;

        return {
          low: toFeeAmount(estimations[0]?.fee, MIN_TX_FEE),
          medium: toFeeAmount(estimations[1]?.fee, DEFAULT_TX_FEE),
          high: toFeeAmount(estimations[2]?.fee, DEFAULT_TX_FEE * BigInt(2)),
        };
      }
    }

    // Fallback to transfer fee estimation
    const response = await fetch(
      `${config.apiUrl}/v2/fees/transfer`,
      {
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new ApiError(
        `Fee estimation failed: ${response.statusText}`,
        response.status,
        `${config.apiUrl}/v2/fees/transfer`
      );
    }

    const feeRate: unknown = await response.json();

    const feeRateNumber = toFiniteNumber(feeRate);
    if (feeRateNumber === null || feeRateNumber <= 0) {
      // Use default if API returns unexpected format
      return getDefaultFeeEstimate();
    }

    // Calculate fee based on estimated size and fee rate
    const rawBaseFee = Math.ceil(feeRateNumber * safeEstimatedSize);
    if (!Number.isFinite(rawBaseFee) || rawBaseFee <= 0) {
      return getDefaultFeeEstimate();
    }

    const baseFee = BigInt(rawBaseFee);

    return {
      low: baseFee,
      medium: baseFee + baseFee / BigInt(4), // +25%
      high: baseFee + baseFee / BigInt(2), // +50%
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Return default on network errors
    return getDefaultFeeEstimate();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Gets a default fee estimate when API is unavailable
 *
 * @returns Default fee estimate
 */
export function getDefaultFeeEstimate(): FeeEstimate {
  return {
    low: MIN_TX_FEE,
    medium: DEFAULT_TX_FEE,
    high: DEFAULT_TX_FEE * BigInt(2),
  };
}

/**
 * Selects the appropriate fee based on priority
 *
 * @param estimate - Fee estimate
 * @param priority - Fee priority level
 * @returns Selected fee in microSTX
 */
export function selectFee(
  estimate: FeeEstimate,
  priority: 'low' | 'medium' | 'high' = 'medium'
): MicroStx {
  return estimate[priority];
}

/**
 * Multiplies a fee by a factor (for bumping stuck transactions)
 *
 * @param fee - Original fee
 * @param factor - Multiplication factor (e.g., 1.5 for 50% increase)
 * @returns New fee in microSTX
 *
 * @example
 * ```typescript
 * const bumpedFee = multiplyFee(1000n, 1.5); // 1500n
 * ```
 */
export function multiplyFee(fee: MicroStx, factor: number): MicroStx {
  if (factor <= 0) {
    throw new InvalidFeeError(fee, 'Fee factor must be positive');
  }

  const result = BigInt(Math.ceil(Number(fee) * factor));

  // Ensure we don't exceed max fee
  if (result > MAX_TX_FEE) {
    return MAX_TX_FEE;
  }

  return result;
}

/**
 * Calculates the fee required to replace a pending transaction
 *
 * @param currentFee - Current transaction fee
 * @param minIncrease - Minimum required increase (default: 25%)
 * @returns Replacement fee in microSTX
 */
export function calculateReplacementFee(
  currentFee: MicroStx,
  minIncrease = 0.25
): MicroStx {
  return multiplyFee(currentFee, 1 + minIncrease);
}
