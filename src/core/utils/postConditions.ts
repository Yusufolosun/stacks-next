/**
 * Post-condition builder DSL and conversion helpers.
 */

import {
  FungibleConditionCode,
  NonFungibleConditionCode,
  PostConditionMode as NativePostConditionMode,
  isClarityName,
  makeStandardFungiblePostCondition,
  makeStandardNonFungiblePostCondition,
  makeStandardSTXPostCondition,
  type ClarityValue,
  type PostCondition as NativePostCondition,
} from "@stacks/transactions";
import {
  CONTRACT_NAME_MAX_LENGTH,
  CONTRACT_NAME_MIN_LENGTH,
} from "../constants";
import { InvalidAmountError, InvalidContractError } from "../errors";
import type {
  FungiblePostCondition,
  MicroStx,
  NonFungiblePostCondition,
  PostCondition,
  PostConditionComparison,
  PostConditionMode,
  StacksAddress,
  StxPostCondition,
} from "../types";
import { assertValidAddress } from "./address";

export interface PostConditionAsset {
  contractAddress: StacksAddress;
  contractName: string;
  assetName: string;
}

const FUNGIBLE_CODE_MAP: Record<
  PostConditionComparison,
  FungibleConditionCode
> = {
  eq: FungibleConditionCode.Equal,
  gt: FungibleConditionCode.Greater,
  gte: FungibleConditionCode.GreaterEqual,
  lt: FungibleConditionCode.Less,
  lte: FungibleConditionCode.LessEqual,
};

function assertContractName(contractName: string): void {
  if (
    contractName.length < CONTRACT_NAME_MIN_LENGTH ||
    contractName.length > CONTRACT_NAME_MAX_LENGTH ||
    !isClarityName(contractName)
  ) {
    throw new InvalidContractError(contractName);
  }
}

function assertAssetName(assetName: string): void {
  if (!assetName || !isClarityName(assetName)) {
    throw new InvalidContractError(assetName);
  }
}

function assertMicroAmount(amount: bigint): void {
  if (amount < BigInt(0)) {
    throw new InvalidAmountError(amount, "Amount cannot be negative");
  }
}

function assertFungibleAmount(amount: bigint): void {
  if (amount < BigInt(0)) {
    throw new InvalidAmountError(amount, "Amount cannot be negative");
  }
}

function assertAsset(asset: PostConditionAsset): void {
  assertValidAddress(asset.contractAddress);
  assertContractName(asset.contractName);
  assertAssetName(asset.assetName);
}

function toAssetInfo(asset: PostConditionAsset): string {
  return `${asset.contractAddress}.${asset.contractName}::${asset.assetName}`;
}

/**
 * Creates a typed STX post-condition descriptor.
 */
export function createStxPostCondition(
  address: StacksAddress,
  condition: PostConditionComparison,
  amount: MicroStx,
): StxPostCondition {
  assertValidAddress(address);
  assertMicroAmount(amount);

  return {
    type: "stx",
    address,
    condition,
    amount,
  };
}

/**
 * Creates a typed fungible-token post-condition descriptor.
 */
export function createFungiblePostCondition(
  address: StacksAddress,
  asset: PostConditionAsset,
  condition: PostConditionComparison,
  amount: bigint,
): FungiblePostCondition {
  assertValidAddress(address);
  assertAsset(asset);
  assertFungibleAmount(amount);

  return {
    type: "fungible",
    address,
    contractAddress: asset.contractAddress,
    contractName: asset.contractName,
    assetName: asset.assetName,
    condition,
    amount,
  };
}

/**
 * Creates a typed non-fungible-token post-condition descriptor.
 */
export function createNonFungiblePostCondition(
  address: StacksAddress,
  asset: PostConditionAsset,
  tokenId: ClarityValue,
  condition: "sent" | "not-sent",
): NonFungiblePostCondition {
  assertValidAddress(address);
  assertAsset(asset);

  return {
    type: "non-fungible",
    address,
    contractAddress: asset.contractAddress,
    contractName: asset.contractName,
    assetName: asset.assetName,
    tokenId,
    condition,
  };
}

/**
 * Converts package-level post-condition mode to Stacks SDK mode.
 */
export function toNativePostConditionMode(
  mode: PostConditionMode,
): NativePostConditionMode {
  return mode === "allow"
    ? NativePostConditionMode.Allow
    : NativePostConditionMode.Deny;
}

/**
 * Converts a package-level post-condition descriptor to Stacks SDK post-condition.
 */
export function toNativePostCondition(
  postCondition: PostCondition,
): NativePostCondition {
  if (postCondition.type === "stx") {
    return makeStandardSTXPostCondition(
      postCondition.address,
      FUNGIBLE_CODE_MAP[postCondition.condition],
      postCondition.amount,
    );
  }

  if (postCondition.type === "fungible") {
    return makeStandardFungiblePostCondition(
      postCondition.address,
      FUNGIBLE_CODE_MAP[postCondition.condition],
      postCondition.amount,
      toAssetInfo(postCondition),
    );
  }

  return makeStandardNonFungiblePostCondition(
    postCondition.address,
    postCondition.condition === "sent"
      ? NonFungibleConditionCode.Sends
      : NonFungibleConditionCode.DoesNotSend,
    toAssetInfo(postCondition),
    postCondition.tokenId,
  );
}

/**
 * Converts an array of package-level post-conditions to SDK post-conditions.
 */
export function toNativePostConditions(
  postConditions: readonly PostCondition[],
): NativePostCondition[] {
  return postConditions.map(toNativePostCondition);
}

class StxConditionBuilder {
  constructor(
    private readonly owner: PostConditionBuilder,
    private readonly address: StacksAddress,
  ) {}

  public eq(amount: MicroStx): PostConditionBuilder {
    return this.owner.add(createStxPostCondition(this.address, "eq", amount));
  }

  public gt(amount: MicroStx): PostConditionBuilder {
    return this.owner.add(createStxPostCondition(this.address, "gt", amount));
  }

  public gte(amount: MicroStx): PostConditionBuilder {
    return this.owner.add(createStxPostCondition(this.address, "gte", amount));
  }

  public lt(amount: MicroStx): PostConditionBuilder {
    return this.owner.add(createStxPostCondition(this.address, "lt", amount));
  }

  public lte(amount: MicroStx): PostConditionBuilder {
    return this.owner.add(createStxPostCondition(this.address, "lte", amount));
  }
}

class FungibleConditionBuilder {
  constructor(
    private readonly owner: PostConditionBuilder,
    private readonly address: StacksAddress,
    private readonly asset: PostConditionAsset,
  ) {}

  public eq(amount: bigint): PostConditionBuilder {
    return this.owner.add(
      createFungiblePostCondition(this.address, this.asset, "eq", amount),
    );
  }

  public gt(amount: bigint): PostConditionBuilder {
    return this.owner.add(
      createFungiblePostCondition(this.address, this.asset, "gt", amount),
    );
  }

  public gte(amount: bigint): PostConditionBuilder {
    return this.owner.add(
      createFungiblePostCondition(this.address, this.asset, "gte", amount),
    );
  }

  public lt(amount: bigint): PostConditionBuilder {
    return this.owner.add(
      createFungiblePostCondition(this.address, this.asset, "lt", amount),
    );
  }

  public lte(amount: bigint): PostConditionBuilder {
    return this.owner.add(
      createFungiblePostCondition(this.address, this.asset, "lte", amount),
    );
  }
}

class NonFungibleConditionBuilder {
  constructor(
    private readonly owner: PostConditionBuilder,
    private readonly address: StacksAddress,
    private readonly asset: PostConditionAsset,
    private readonly tokenId: ClarityValue,
  ) {}

  public sent(): PostConditionBuilder {
    return this.owner.add(
      createNonFungiblePostCondition(
        this.address,
        this.asset,
        this.tokenId,
        "sent",
      ),
    );
  }

  public notSent(): PostConditionBuilder {
    return this.owner.add(
      createNonFungiblePostCondition(
        this.address,
        this.asset,
        this.tokenId,
        "not-sent",
      ),
    );
  }
}

/**
 * Fluent post-condition DSL builder.
 */
export class PostConditionBuilder {
  private readonly conditions: PostCondition[] = [];

  public stx(address: StacksAddress): StxConditionBuilder {
    assertValidAddress(address);
    return new StxConditionBuilder(this, address);
  }

  public fungible(
    address: StacksAddress,
    asset: PostConditionAsset,
  ): FungibleConditionBuilder {
    assertValidAddress(address);
    assertAsset(asset);
    return new FungibleConditionBuilder(this, address, asset);
  }

  public nonFungible(
    address: StacksAddress,
    asset: PostConditionAsset,
    tokenId: ClarityValue,
  ): NonFungibleConditionBuilder {
    assertValidAddress(address);
    assertAsset(asset);
    return new NonFungibleConditionBuilder(this, address, asset, tokenId);
  }

  public add(postCondition: PostCondition): PostConditionBuilder {
    this.conditions.push(postCondition);
    return this;
  }

  public addMany(
    postConditions: readonly PostCondition[],
  ): PostConditionBuilder {
    this.conditions.push(...postConditions);
    return this;
  }

  public clear(): PostConditionBuilder {
    this.conditions.length = 0;
    return this;
  }

  public build(): PostCondition[] {
    return [...this.conditions];
  }

  public buildNative(): NativePostCondition[] {
    return toNativePostConditions(this.conditions);
  }
}

/**
 * Factory for a fluent post-condition builder.
 */
export function createPostConditionBuilder(): PostConditionBuilder {
  return new PostConditionBuilder();
}

/**
 * Compact alias for creating a post-condition builder.
 */
export const pc = createPostConditionBuilder;
