/**
 * Tests for ABI-aware contract read client.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { uintCV } from "@stacks/transactions";
import type { ClarityAbi } from "@stacks/transactions";
import { createStacksConfig } from "../../../src/core/config";
import { InvalidFunctionError } from "../../../src/core/errors";
import {
  createContractReadClient,
  fetchContractAbi,
} from "../../../src/server/contractClient";

const ADDRESS = "SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4";

const ABI: ClarityAbi = {
  functions: [
    {
      name: "get-balance",
      access: "read_only",
      args: [{ name: "who", type: "principal" }],
      outputs: { type: "uint128" },
    },
    {
      name: "set-balance",
      access: "public",
      args: [{ name: "amount", type: "uint128" }],
      outputs: {
        type: {
          response: {
            ok: "bool",
            error: "uint128",
          },
        },
      },
    },
  ],
  variables: [],
  maps: [],
  fungible_tokens: [],
  non_fungible_tokens: [],
};

describe("createContractReadClient", () => {
  const config = createStacksConfig({ network: "testnet" });

  it("creates methods from read-only ABI functions", async () => {
    const readOnlyCaller = vi.fn().mockResolvedValue(uintCV(42));

    const client = await createContractReadClient({
      config,
      contractAddress: ADDRESS,
      contractName: "my-contract",
      defaultSenderAddress: ADDRESS,
      abi: ABI,
      readOnlyCaller,
    });

    const result = await client.call("get-balance", [uintCV(1)]);

    expect(result.repr).toBe("u42");
    expect(readOnlyCaller).toHaveBeenCalledTimes(1);
  });

  it("throws for non read-only function calls", async () => {
    const client = await createContractReadClient({
      config,
      contractAddress: ADDRESS,
      contractName: "my-contract",
      defaultSenderAddress: ADDRESS,
      abi: ABI,
      readOnlyCaller: vi.fn().mockResolvedValue(uintCV(1)),
    });

    await expect(
      client.call("set-balance" as never, [uintCV(1)] as never),
    ).rejects.toThrow(InvalidFunctionError);
  });

  it("loads ABI when not provided", async () => {
    const abiLoader = vi.fn().mockResolvedValue(ABI);

    const client = await createContractReadClient({
      config,
      contractAddress: ADDRESS,
      contractName: "my-contract",
      defaultSenderAddress: ADDRESS,
      readOnlyCaller: vi.fn().mockResolvedValue(uintCV(10)),
      abiLoader,
    });

    expect(client.abi.functions).toHaveLength(2);
    expect(abiLoader).toHaveBeenCalledTimes(1);
  });
});

describe("fetchContractAbi", () => {
  const config = createStacksConfig({ network: "testnet" });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses ABI payloads from API response shape", async () => {
    const fetcher: typeof fetch = vi.fn(
      async () => new Response(JSON.stringify({ abi: ABI }), { status: 200 }),
    ) as unknown as typeof fetch;

    const abi = await fetchContractAbi(config, ADDRESS, "my-contract", fetcher);

    expect(abi.functions).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
