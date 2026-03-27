/**
 * Tests for conversion utilities
 */

import { describe, it, expect } from "vitest";
import {
  stxToMicroStx,
  microStxToStx,
  formatStx,
  parseStx,
  compareMicroStx,
  addMicroStx,
  subtractMicroStx,
  isZeroMicroStx,
  maxMicroStx,
  minMicroStx,
} from "../../../../src/core/utils/conversion";
import { InvalidAmountError } from "../../../../src/core/errors";

describe("stxToMicroStx", () => {
  it("converts integer STX to microSTX", () => {
    expect(stxToMicroStx(1)).toBe(BigInt(1_000_000));
    expect(stxToMicroStx(10)).toBe(BigInt(10_000_000));
  });

  it("converts decimal STX to microSTX", () => {
    expect(stxToMicroStx(0.5)).toBe(BigInt(500_000));
    expect(stxToMicroStx(1.5)).toBe(BigInt(1_500_000));
    expect(stxToMicroStx(0.000001)).toBe(BigInt(1));
  });

  it("converts string STX to microSTX", () => {
    expect(stxToMicroStx("1")).toBe(BigInt(1_000_000));
    expect(stxToMicroStx("1.5")).toBe(BigInt(1_500_000));
    expect(stxToMicroStx("1e-6")).toBe(BigInt(1));
  });

  it("converts bigint STX to microSTX", () => {
    expect(stxToMicroStx(BigInt(1))).toBe(BigInt(1_000_000));
  });

  it("throws for invalid amounts", () => {
    expect(() => stxToMicroStx("invalid")).toThrow(InvalidAmountError);
    expect(() => stxToMicroStx(NaN)).toThrow(InvalidAmountError);
  });

  it("throws for negative amounts", () => {
    expect(() => stxToMicroStx(-1)).toThrow(InvalidAmountError);
  });

  it("throws when decimal precision exceeds 6 places", () => {
    expect(() => stxToMicroStx("0.0000001")).toThrow(InvalidAmountError);
  });
});

describe("microStxToStx", () => {
  it("converts microSTX to STX", () => {
    expect(microStxToStx(BigInt(1_000_000))).toBe(1);
    expect(microStxToStx(BigInt(500_000))).toBe(0.5);
    expect(microStxToStx(BigInt(1))).toBe(0.000001);
  });

  it("accepts number and string inputs", () => {
    expect(microStxToStx(1_000_000)).toBe(1);
    expect(microStxToStx("1000000")).toBe(1);
  });

  it("throws when amount exceeds safe number conversion range", () => {
    expect(() => microStxToStx(BigInt("9007199254740992000000"))).toThrow(
      InvalidAmountError,
    );
  });
});

describe("formatStx", () => {
  it("formats with default options", () => {
    expect(formatStx(BigInt(1_000_000))).toBe("1.000000 STX");
  });

  it("formats with custom decimals", () => {
    expect(formatStx(BigInt(1_000_000), { decimals: 2 })).toBe("1.00 STX");
  });

  it("formats without symbol", () => {
    expect(formatStx(BigInt(1_000_000), { symbol: false })).toBe("1.000000");
  });
});

describe("parseStx", () => {
  it("parses STX strings", () => {
    expect(parseStx("1.5 STX")).toBe(BigInt(1_500_000));
    expect(parseStx("1.5")).toBe(BigInt(1_500_000));
  });

  it("parses strings with commas", () => {
    expect(parseStx("1,000 STX")).toBe(BigInt(1_000_000_000));
  });

  it("throws for invalid strings", () => {
    expect(() => parseStx("invalid")).toThrow(InvalidAmountError);
    expect(() => parseStx("")).toThrow(InvalidAmountError);
  });
});

describe("compareMicroStx", () => {
  it("compares amounts correctly", () => {
    expect(compareMicroStx(BigInt(100), BigInt(200))).toBe(-1);
    expect(compareMicroStx(BigInt(200), BigInt(100))).toBe(1);
    expect(compareMicroStx(BigInt(100), BigInt(100))).toBe(0);
  });
});

describe("addMicroStx", () => {
  it("adds multiple amounts", () => {
    expect(addMicroStx(BigInt(100), BigInt(200), BigInt(300))).toBe(
      BigInt(600),
    );
  });

  it("returns 0 for no arguments", () => {
    expect(addMicroStx()).toBe(BigInt(0));
  });
});

describe("subtractMicroStx", () => {
  it("subtracts amounts", () => {
    expect(subtractMicroStx(BigInt(500), BigInt(200), BigInt(100))).toBe(
      BigInt(200),
    );
  });
});

describe("isZeroMicroStx", () => {
  it("identifies zero amounts", () => {
    expect(isZeroMicroStx(BigInt(0))).toBe(true);
    expect(isZeroMicroStx(BigInt(1))).toBe(false);
  });
});

describe("maxMicroStx", () => {
  it("returns the maximum amount", () => {
    expect(maxMicroStx(BigInt(100), BigInt(300), BigInt(200))).toBe(
      BigInt(300),
    );
  });

  it("returns 0 for no arguments", () => {
    expect(maxMicroStx()).toBe(BigInt(0));
  });
});

describe("minMicroStx", () => {
  it("returns the minimum amount", () => {
    expect(minMicroStx(BigInt(100), BigInt(300), BigInt(200))).toBe(
      BigInt(100),
    );
  });

  it("returns 0 for no arguments", () => {
    expect(minMicroStx()).toBe(BigInt(0));
  });
});
