/**
 * Tests for address utilities
 */

import { describe, it, expect } from "vitest";
import {
  isValidStacksAddress,
  isValidContractId,
  isValidTxId,
  shortenAddress,
  getNetworkFromAddress,
  isAddressForNetwork,
  parseContractId,
  createContractId,
} from "../../../../src/core/utils/address";

const VALID_ADDRESSES = {
  mainnetSingleSig: "SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4",
  mainnetMultiSig: "SMJ6HB7H6NWVVR14D2PF2DBSQQG28T5CXNNMN1G",
  testnetSingleSig: "STJ6HB7H6NWVVR14D2PF2DBSQQG28T5CW5BEERV",
  testnetMultiSig: "SNJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY76R4AM",
} as const;

describe("isValidStacksAddress", () => {
  it("validates mainnet single-sig addresses (SP)", () => {
    expect(isValidStacksAddress(VALID_ADDRESSES.mainnetSingleSig)).toBe(true);
  });

  it("validates mainnet multi-sig addresses (SM)", () => {
    expect(isValidStacksAddress(VALID_ADDRESSES.mainnetMultiSig)).toBe(true);
  });

  it("validates testnet single-sig addresses (ST)", () => {
    expect(isValidStacksAddress(VALID_ADDRESSES.testnetSingleSig)).toBe(true);
  });

  it("validates testnet multi-sig addresses (SN)", () => {
    expect(isValidStacksAddress(VALID_ADDRESSES.testnetMultiSig)).toBe(true);
  });

  it("rejects invalid addresses", () => {
    expect(isValidStacksAddress("invalid")).toBe(false);
    expect(isValidStacksAddress("")).toBe(false);
    expect(isValidStacksAddress("0x1234567890abcdef")).toBe(false);
    expect(isValidStacksAddress("SP")).toBe(false);
  });

  it("rejects null and undefined", () => {
    expect(isValidStacksAddress(null as unknown as string)).toBe(false);
    expect(isValidStacksAddress(undefined as unknown as string)).toBe(false);
  });
});

describe("isValidContractId", () => {
  it("validates contract IDs", () => {
    expect(
      isValidContractId(`${VALID_ADDRESSES.mainnetSingleSig}.my-contract`),
    ).toBe(true);
    expect(
      isValidContractId(
        `${VALID_ADDRESSES.testnetSingleSig}.test-contract-123`,
      ),
    ).toBe(true);
  });

  it("rejects invalid contract IDs", () => {
    expect(isValidContractId("invalid")).toBe(false);
    expect(isValidContractId(VALID_ADDRESSES.mainnetSingleSig)).toBe(false);
    expect(isValidContractId(".my-contract")).toBe(false);
    expect(
      isValidContractId(`${VALID_ADDRESSES.mainnetSingleSig}.1-invalid`),
    ).toBe(false);
  });
});

describe("isValidTxId", () => {
  it("validates transaction IDs", () => {
    expect(
      isValidTxId(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      ),
    ).toBe(true);
  });

  it("rejects invalid transaction IDs", () => {
    expect(isValidTxId("invalid")).toBe(false);
    expect(isValidTxId("1234567890abcdef")).toBe(false);
    expect(isValidTxId("0x123")).toBe(false);
  });
});

describe("shortenAddress", () => {
  it("shortens address with default length", () => {
    expect(shortenAddress(VALID_ADDRESSES.mainnetSingleSig)).toBe(
      "SPJ6H...N5NT4",
    );
  });

  it("shortens address with custom length", () => {
    expect(shortenAddress(VALID_ADDRESSES.mainnetSingleSig, 3)).toBe(
      "SPJ...NT4",
    );
  });

  it("returns empty string for empty input", () => {
    expect(shortenAddress("")).toBe("");
  });

  it("returns original if already short", () => {
    expect(shortenAddress("SP2J", 5)).toBe("SP2J");
  });
});

describe("getNetworkFromAddress", () => {
  it("identifies mainnet addresses", () => {
    expect(getNetworkFromAddress(VALID_ADDRESSES.mainnetSingleSig)).toBe(
      "mainnet",
    );
    expect(getNetworkFromAddress(VALID_ADDRESSES.mainnetMultiSig)).toBe(
      "mainnet",
    );
  });

  it("identifies testnet addresses", () => {
    expect(getNetworkFromAddress(VALID_ADDRESSES.testnetSingleSig)).toBe(
      "testnet",
    );
    expect(getNetworkFromAddress(VALID_ADDRESSES.testnetMultiSig)).toBe(
      "testnet",
    );
  });

  it("returns undefined for invalid addresses", () => {
    expect(getNetworkFromAddress("invalid")).toBe(undefined);
    expect(getNetworkFromAddress("")).toBe(undefined);
  });
});

describe("isAddressForNetwork", () => {
  it("matches exact networks and treats devnet as testnet address space", () => {
    expect(
      isAddressForNetwork(VALID_ADDRESSES.mainnetSingleSig, "mainnet"),
    ).toBe(true);
    expect(
      isAddressForNetwork(VALID_ADDRESSES.testnetSingleSig, "testnet"),
    ).toBe(true);
    expect(
      isAddressForNetwork(VALID_ADDRESSES.testnetSingleSig, "devnet"),
    ).toBe(true);
    expect(
      isAddressForNetwork(VALID_ADDRESSES.mainnetSingleSig, "testnet"),
    ).toBe(false);
  });
});

describe("parseContractId", () => {
  it("parses valid contract IDs", () => {
    const result = parseContractId(
      `${VALID_ADDRESSES.mainnetSingleSig}.my-contract`,
    );
    expect(result).toEqual({
      address: VALID_ADDRESSES.mainnetSingleSig,
      contractName: "my-contract",
    });
  });

  it("returns null for invalid contract IDs", () => {
    expect(parseContractId("invalid")).toBe(null);
    expect(parseContractId("")).toBe(null);
  });
});

describe("createContractId", () => {
  it("creates contract IDs", () => {
    expect(
      createContractId(VALID_ADDRESSES.mainnetSingleSig, "my-contract"),
    ).toBe(`${VALID_ADDRESSES.mainnetSingleSig}.my-contract`);
  });
});
