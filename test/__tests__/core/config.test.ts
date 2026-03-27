/**
 * Tests for config utilities
 */

import { afterEach, describe, expect, it } from "vitest";
import {
  createStacksConfig,
  getConfigFromEnv,
  isMainnet,
  isTestnet,
  isDevnet,
} from "../../../src/core/config";
import { InvalidNetworkError } from "../../../src/core/errors";

describe("createStacksConfig", () => {
  it("creates mainnet config", () => {
    const config = createStacksConfig({ network: "mainnet" });

    expect(config.networkType).toBe("mainnet");
    expect(config.apiUrl).toContain("mainnet");
    expect(isMainnet(config)).toBe(true);
  });

  it("creates testnet config with custom api url", () => {
    const config = createStacksConfig({
      network: "testnet",
      apiUrl: "https://custom.example.com",
    });

    expect(config.networkType).toBe("testnet");
    expect(config.apiUrl).toBe("https://custom.example.com");
    expect(isTestnet(config)).toBe(true);
  });

  it("creates devnet config", () => {
    const config = createStacksConfig({ network: "devnet" });

    expect(config.networkType).toBe("devnet");
    expect(isDevnet(config)).toBe(true);
  });

  it("throws for invalid network values", () => {
    expect(() => createStacksConfig({ network: "invalid" as never })).toThrow(
      InvalidNetworkError,
    );
  });
});

describe("getConfigFromEnv", () => {
  const previousEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it("prefers NEXT_PUBLIC env vars", () => {
    process.env["NEXT_PUBLIC_STACKS_NETWORK"] = "mainnet";
    process.env["NEXT_PUBLIC_STACKS_API_URL"] =
      "https://env-mainnet.example.com";

    const config = getConfigFromEnv();
    expect(config.networkType).toBe("mainnet");
    expect(config.apiUrl).toBe("https://env-mainnet.example.com");
  });

  it("falls back to STACKS_* env vars", () => {
    delete process.env["NEXT_PUBLIC_STACKS_NETWORK"];
    delete process.env["NEXT_PUBLIC_STACKS_API_URL"];
    process.env["STACKS_NETWORK"] = "testnet";
    process.env["STACKS_API_URL"] = "https://env-testnet.example.com";

    const config = getConfigFromEnv();
    expect(config.networkType).toBe("testnet");
    expect(config.apiUrl).toBe("https://env-testnet.example.com");
  });

  it("defaults to testnet when env vars are missing", () => {
    delete process.env["NEXT_PUBLIC_STACKS_NETWORK"];
    delete process.env["NEXT_PUBLIC_STACKS_API_URL"];
    delete process.env["STACKS_NETWORK"];
    delete process.env["STACKS_API_URL"];

    const config = getConfigFromEnv();
    expect(config.networkType).toBe("testnet");
  });
});
