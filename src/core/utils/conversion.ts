/**
 * STX and microSTX conversion utilities
 */

import { MICRO_STX_PER_STX, STX_TOKEN } from "../constants";
import { InvalidAmountError } from "../errors";
import type { MicroStx } from "../types";

const MAX_DECIMALS = 6;
const DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;

function normalizeNumberInput(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    throw new InvalidAmountError(value);
  }

  if (value < 0) {
    throw new InvalidAmountError(value, "Amount cannot be negative");
  }

  // Convert scientific notation into a stable decimal representation.
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 20,
  });
}

function parseDecimalToMicroStx(rawValue: string): MicroStx {
  const value = rawValue.trim();

  if (!value || !DECIMAL_PATTERN.test(value)) {
    throw new InvalidAmountError(rawValue);
  }

  const [wholePart, fractionPart = ""] = value.split(".");
  if (!wholePart) {
    throw new InvalidAmountError(rawValue);
  }

  if (
    fractionPart.length > MAX_DECIMALS &&
    /[1-9]/.test(fractionPart.slice(MAX_DECIMALS))
  ) {
    throw new InvalidAmountError(
      rawValue,
      "Amount supports up to 6 decimal places",
    );
  }

  const truncatedFraction = fractionPart.slice(0, MAX_DECIMALS);
  const paddedFraction = truncatedFraction.padEnd(MAX_DECIMALS, "0");

  return BigInt(wholePart) * MICRO_STX_PER_STX + BigInt(paddedFraction);
}

/**
 * Converts STX to microSTX
 *
 * @param stx - Amount in STX (can be number, string, or bigint)
 * @returns Amount in microSTX as bigint
 *
 * @example
 * ```typescript
 * stxToMicroStx(1); // 1000000n
 * stxToMicroStx(0.5); // 500000n
 * stxToMicroStx('1.5'); // 1500000n
 * ```
 */
export function stxToMicroStx(stx: number | string | bigint): MicroStx {
  if (typeof stx === "bigint") {
    if (stx < BigInt(0)) {
      throw new InvalidAmountError(stx, "Amount cannot be negative");
    }

    return stx * MICRO_STX_PER_STX;
  }

  if (typeof stx === "number") {
    return parseDecimalToMicroStx(normalizeNumberInput(stx));
  }

  const trimmed = stx.trim();
  if (!trimmed) {
    throw new InvalidAmountError(stx);
  }

  if (!DECIMAL_PATTERN.test(trimmed)) {
    const parsed = Number(trimmed);
    return parseDecimalToMicroStx(normalizeNumberInput(parsed));
  }

  return parseDecimalToMicroStx(trimmed);
}

/**
 * Converts microSTX to STX
 *
 * @param microStx - Amount in microSTX
 * @returns Amount in STX as number
 *
 * @example
 * ```typescript
 * microStxToStx(1000000n); // 1
 * microStxToStx(500000n); // 0.5
 * ```
 */
export function microStxToStx(microStx: MicroStx | number | string): number {
  const microStxBigInt =
    typeof microStx === "bigint" ? microStx : BigInt(microStx);

  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER) * MICRO_STX_PER_STX;
  if (microStxBigInt > maxSafe || microStxBigInt < -maxSafe) {
    throw new InvalidAmountError(
      microStxBigInt,
      "Amount is too large to safely convert to a JavaScript number",
    );
  }

  return Number(microStxBigInt) / Number(MICRO_STX_PER_STX);
}

/**
 * Formats STX amount for display
 *
 * @param microStx - Amount in microSTX
 * @param options - Formatting options
 * @returns Formatted string
 *
 * @example
 * ```typescript
 * formatStx(1000000n); // '1.000000 STX'
 * formatStx(1000000n, { decimals: 2 }); // '1.00 STX'
 * formatStx(1000000n, { symbol: false }); // '1.000000'
 * ```
 */
export function formatStx(
  microStx: MicroStx | number | string,
  options: {
    decimals?: number;
    symbol?: boolean;
    locale?: string;
  } = {},
): string {
  const {
    decimals = STX_TOKEN.decimals,
    symbol = true,
    locale = "en-US",
  } = options;

  const stx = microStxToStx(microStx);

  const formatted = stx.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return symbol ? `${formatted} ${STX_TOKEN.symbol}` : formatted;
}

/**
 * Formats STX amount with compact notation for large values
 *
 * @param microStx - Amount in microSTX
 * @param options - Formatting options
 * @returns Formatted string
 *
 * @example
 * ```typescript
 * formatStxCompact(1000000000000n); // '1M STX'
 * formatStxCompact(1500000000n); // '1.5K STX'
 * ```
 */
export function formatStxCompact(
  microStx: MicroStx | number | string,
  options: {
    symbol?: boolean;
    locale?: string;
  } = {},
): string {
  const { symbol = true, locale = "en-US" } = options;

  const stx = microStxToStx(microStx);

  const formatted = stx.toLocaleString(locale, {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  return symbol ? `${formatted} ${STX_TOKEN.symbol}` : formatted;
}

/**
 * Parses a STX string to microSTX
 *
 * @param value - String value (e.g., '1.5 STX', '1000000', '1.5')
 * @returns Amount in microSTX
 *
 * @example
 * ```typescript
 * parseStx('1.5 STX'); // 1500000n
 * parseStx('1.5'); // 1500000n
 * parseStx('1000000'); // 1000000000000n (assumes STX if no decimal)
 * ```
 */
export function parseStx(value: string): MicroStx {
  if (!value || typeof value !== "string") {
    throw new InvalidAmountError(value);
  }

  // Remove STX suffix and whitespace
  const cleaned = value.replace(/\s*STX\s*/i, "").trim();

  // Remove thousand separators
  const normalized = cleaned.replace(/,/g, "");

  return stxToMicroStx(normalized);
}

/**
 * Compares two microSTX amounts
 *
 * @param a - First amount
 * @param b - Second amount
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareMicroStx(
  a: MicroStx | number | string,
  b: MicroStx | number | string,
): -1 | 0 | 1 {
  const aBigInt = typeof a === "bigint" ? a : BigInt(a);
  const bBigInt = typeof b === "bigint" ? b : BigInt(b);

  if (aBigInt < bBigInt) return -1;
  if (aBigInt > bBigInt) return 1;
  return 0;
}

/**
 * Adds multiple microSTX amounts
 *
 * @param amounts - Array of amounts to add
 * @returns Total in microSTX
 */
export function addMicroStx(
  ...amounts: (MicroStx | number | string)[]
): MicroStx {
  return amounts.reduce<MicroStx>((total, amount) => {
    const amountBigInt = typeof amount === "bigint" ? amount : BigInt(amount);
    return total + amountBigInt;
  }, BigInt(0));
}

/**
 * Subtracts microSTX amounts
 *
 * @param from - Amount to subtract from
 * @param amounts - Amounts to subtract
 * @returns Result in microSTX
 */
export function subtractMicroStx(
  from: MicroStx | number | string,
  ...amounts: (MicroStx | number | string)[]
): MicroStx {
  const fromBigInt = typeof from === "bigint" ? from : BigInt(from);
  const total = addMicroStx(...amounts);
  return fromBigInt - total;
}

/**
 * Checks if an amount is zero
 *
 * @param amount - Amount to check
 * @returns true if the amount is zero
 */
export function isZeroMicroStx(amount: MicroStx | number | string): boolean {
  const amountBigInt = typeof amount === "bigint" ? amount : BigInt(amount);
  return amountBigInt === BigInt(0);
}

/**
 * Returns the maximum of multiple amounts
 *
 * @param amounts - Amounts to compare
 * @returns The maximum amount
 */
export function maxMicroStx(
  ...amounts: (MicroStx | number | string)[]
): MicroStx {
  if (amounts.length === 0) {
    return BigInt(0);
  }

  return amounts.reduce<MicroStx>((max, amount) => {
    const amountBigInt = typeof amount === "bigint" ? amount : BigInt(amount);
    return amountBigInt > max ? amountBigInt : max;
  }, BigInt(0));
}

/**
 * Returns the minimum of multiple amounts
 *
 * @param amounts - Amounts to compare
 * @returns The minimum amount
 */
export function minMicroStx(
  ...amounts: (MicroStx | number | string)[]
): MicroStx {
  if (amounts.length === 0) {
    return BigInt(0);
  }

  const first = amounts[0];
  const firstBigInt = typeof first === "bigint" ? first : BigInt(first ?? 0);

  return amounts.reduce<MicroStx>((min, amount) => {
    const amountBigInt = typeof amount === "bigint" ? amount : BigInt(amount);
    return amountBigInt < min ? amountBigInt : min;
  }, firstBigInt);
}
