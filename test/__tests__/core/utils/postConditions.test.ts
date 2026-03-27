/**
 * Tests for post-condition utilities and DSL.
 */

import { describe, expect, it } from "vitest";
import { PostConditionMode, uintCV } from "@stacks/transactions";
import {
  createStxPostCondition,
  createFungiblePostCondition,
  createNonFungiblePostCondition,
  createPostConditionBuilder,
  toNativePostCondition,
  toNativePostConditions,
  toNativePostConditionMode,
} from "../../../../src/core/utils/postConditions";

const OWNER = "SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4";
const CONTRACT_ADDRESS = "STJ6HB7H6NWVVR14D2PF2DBSQQG28T5CW5BEERV";

describe("post-condition creators", () => {
  it("creates typed post-condition descriptors", () => {
    const stx = createStxPostCondition(OWNER, "gte", 1000n);
    const ft = createFungiblePostCondition(
      OWNER,
      {
        contractAddress: CONTRACT_ADDRESS,
        contractName: "token",
        assetName: "my-asset",
      },
      "lte",
      10n,
    );
    const nft = createNonFungiblePostCondition(
      OWNER,
      {
        contractAddress: CONTRACT_ADDRESS,
        contractName: "nft-contract",
        assetName: "nft-asset",
      },
      uintCV(42),
      "sent",
    );

    expect(stx.type).toBe("stx");
    expect(ft.type).toBe("fungible");
    expect(nft.type).toBe("non-fungible");
  });
});

describe("post-condition DSL builder", () => {
  it("builds chainable post-condition arrays", () => {
    const conditions = createPostConditionBuilder()
      .stx(OWNER)
      .gte(1000n)
      .fungible(OWNER, {
        contractAddress: CONTRACT_ADDRESS,
        contractName: "token",
        assetName: "my-asset",
      })
      .lte(10n)
      .nonFungible(
        OWNER,
        {
          contractAddress: CONTRACT_ADDRESS,
          contractName: "nft-contract",
          assetName: "nft-asset",
        },
        uintCV(7),
      )
      .sent()
      .build();

    expect(conditions).toHaveLength(3);
    expect(conditions[0]?.type).toBe("stx");
    expect(conditions[1]?.type).toBe("fungible");
    expect(conditions[2]?.type).toBe("non-fungible");
  });
});

describe("native conversion", () => {
  it("maps modes and post-conditions to Stacks SDK types", () => {
    expect(toNativePostConditionMode("allow")).toBe(PostConditionMode.Allow);
    expect(toNativePostConditionMode("deny")).toBe(PostConditionMode.Deny);

    const typed = createStxPostCondition(OWNER, "eq", 1n);
    const native = toNativePostCondition(typed);

    expect(native).toBeDefined();

    const nativeList = toNativePostConditions([typed]);
    expect(nativeList).toHaveLength(1);
  });
});
