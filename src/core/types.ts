/**
 * Core type definitions for @yusufolosun/stacks-next
 *
 * These types are used throughout the package and provide TypeScript-first
 * developer experience for building Stacks dApps with Next.js.
 */

import type { StacksNetwork } from '@stacks/network';
import type { ClarityValue } from '@stacks/transactions';

/**
 * Stacks address (principal)
 */
export type StacksAddress = string;

/**
 * Transaction ID (txid)
 */
export type TxId = string;

/**
 * Block height
 */
export type BlockHeight = number;

/**
 * Micro STX amount (1 STX = 1,000,000 microSTX)
 */
export type MicroStx = bigint;

/**
 * Network type
 */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

/**
 * Post-condition mode
 */
export type PostConditionMode = 'allow' | 'deny';

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'pending'
  | 'success'
  | 'abort_by_response'
  | 'abort_by_post_condition';

/**
 * Post-condition comparison operators
 */
export type PostConditionComparison = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';

/**
 * STX post-condition
 */
export interface StxPostCondition {
  type: 'stx';
  address: StacksAddress;
  condition: PostConditionComparison;
  amount: MicroStx;
}

/**
 * Fungible token post-condition
 */
export interface FungiblePostCondition {
  type: 'fungible';
  address: StacksAddress;
  contractAddress: StacksAddress;
  contractName: string;
  assetName: string;
  condition: PostConditionComparison;
  amount: bigint;
}

/**
 * Non-fungible token post-condition
 */
export interface NonFungiblePostCondition {
  type: 'non-fungible';
  address: StacksAddress;
  contractAddress: StacksAddress;
  contractName: string;
  assetName: string;
  tokenId: ClarityValue;
  condition: 'sent' | 'not-sent';
}

/**
 * Post-condition union type
 */
export type PostCondition =
  | StxPostCondition
  | FungiblePostCondition
  | NonFungiblePostCondition;

/**
 * Transaction info
 */
export interface TransactionInfo {
  txId: TxId;
  status: TransactionStatus;
  blockHeight?: BlockHeight;
  blockHash?: string;
  burnBlockTime?: number;
  fee: MicroStx;
  nonce: number;
  sender: StacksAddress;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Stacks configuration
 */
export interface StacksConfig {
  network: StacksNetwork;
  apiUrl: string;
  networkType: NetworkType;
}

/**
 * Fee estimation result
 */
export interface FeeEstimate {
  low: MicroStx;
  medium: MicroStx;
  high: MicroStx;
}

/**
 * Account balance info
 */
export interface AccountBalance {
  stx: {
    balance: MicroStx;
    locked: MicroStx;
    unlockHeight: BlockHeight;
  };
  fungibleTokens: Record<string, bigint>;
  nonFungibleTokens: Record<string, string[]>;
}

/**
 * Mempool transaction
 */
export interface MempoolTransaction {
  txId: TxId;
  nonce: number;
  fee: MicroStx;
  senderAddress: StacksAddress;
  txType: string;
  receiptTime: number;
  txStatus: 'pending';
}

/**
 * Block info
 */
export interface BlockInfo {
  height: BlockHeight;
  hash: string;
  burnBlockTime: number;
  burnBlockHeight: number;
  parentBlockHash: string;
  txs: TxId[];
}

/**
 * Contract info
 */
export interface ContractInfo {
  contractId: string;
  contractAddress: StacksAddress;
  contractName: string;
  sourceCode: string;
  abi: string;
}

/**
 * STX transfer payload
 */
export interface StxTransferPayload {
  recipient: StacksAddress;
  amount: MicroStx;
  memo?: string;
}

/**
 * Contract call payload
 */
export interface ContractCallPayload {
  contractAddress: StacksAddress;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
}

/**
 * Contract deploy payload
 */
export interface ContractDeployPayload {
  contractName: string;
  codeBody: string;
  clarityVersion?: number;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  fee?: MicroStx;
  nonce?: number;
  postConditionMode?: PostConditionMode;
  postConditions?: PostCondition[];
  sponsored?: boolean;
  anchorMode?: 'onChainOnly' | 'offChainOnly' | 'any';
}

/**
 * Unsigned transaction
 */
export interface UnsignedTransaction {
  serialize: () => Buffer;
  txid: () => string;
}

/**
 * Signed transaction
 */
export interface SignedTransaction extends UnsignedTransaction {
  signature: string;
}

/**
 * Broadcast result
 */
export interface BroadcastResult {
  txId: TxId;
  success: boolean;
  error?: string;
}
