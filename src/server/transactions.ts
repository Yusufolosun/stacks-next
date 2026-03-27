/**
 * Server-side transaction utilities.
 */

import {
  broadcastTransaction,
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
  type AnchorModeName,
  type ClarityAbi,
  type ClarityValue,
  type StacksTransaction,
} from '@stacks/transactions';
import {
  BroadcastFailedError,
  InvalidMemoError,
  StacksNextError,
} from '../core/errors';
import type {
  BroadcastResult,
  MicroStx,
  PostCondition,
  PostConditionMode,
  StacksAddress,
  StacksConfig,
} from '../core/types';
import { assertValidAddress } from '../core/utils/address';
import { isValidMemo } from '../core/utils/memo';
import {
  toNativePostConditionMode,
  toNativePostConditions,
} from '../core/utils/postConditions';

export interface BuildUnsignedStxTransferOptions {
  config: StacksConfig;
  publicKey: string;
  recipient: StacksAddress;
  amount: MicroStx;
  memo?: string;
  fee?: MicroStx;
  nonce?: number;
  sponsored?: boolean;
  anchorMode?: AnchorModeName;
}

export interface BuildUnsignedContractCallOptions {
  config: StacksConfig;
  publicKey: string;
  contractAddress: StacksAddress;
  contractName: string;
  functionName: string;
  functionArgs: ClarityValue[];
  fee?: MicroStx;
  nonce?: number;
  sponsored?: boolean;
  anchorMode?: AnchorModeName;
  postConditionMode?: PostConditionMode;
  postConditions?: PostCondition[];
  validateWithAbi?: boolean | ClarityAbi;
}

export interface CreateServerActionOptions {
  exposeStack?: boolean;
}

export interface ServerActionFailure {
  ok: false;
  error: {
    message: string;
    code?: string;
    stack?: string;
  };
}

export interface ServerActionSuccess<TData> {
  ok: true;
  data: TData;
}

export type ServerActionResult<TData> =
  | ServerActionSuccess<TData>
  | ServerActionFailure;

/**
 * Builds an unsigned STX transfer transaction on the server.
 */
export async function buildUnsignedStxTransfer(
  options: BuildUnsignedStxTransferOptions,
  txFactory: typeof makeUnsignedSTXTokenTransfer = makeUnsignedSTXTokenTransfer
): Promise<StacksTransaction> {
  const {
    config,
    publicKey,
    recipient,
    amount,
    memo,
    fee,
    nonce,
    sponsored,
    anchorMode = 'any',
  } = options;

  assertValidAddress(recipient);

  if (memo && !isValidMemo(memo)) {
    throw new InvalidMemoError(memo, 'Memo exceeds maximum byte length');
  }

  const txOptions: Parameters<typeof makeUnsignedSTXTokenTransfer>[0] = {
    publicKey,
    recipient,
    amount,
    anchorMode,
    network: config.network,
  };

  if (memo !== undefined) {
    txOptions.memo = memo;
  }

  if (fee !== undefined) {
    txOptions.fee = fee;
  }

  if (nonce !== undefined) {
    txOptions.nonce = nonce;
  }

  if (sponsored !== undefined) {
    txOptions.sponsored = sponsored;
  }

  return txFactory(txOptions);
}

/**
 * Builds an unsigned contract call transaction on the server.
 */
export async function buildUnsignedContractCall(
  options: BuildUnsignedContractCallOptions,
  txFactory: typeof makeUnsignedContractCall = makeUnsignedContractCall
): Promise<StacksTransaction> {
  const {
    config,
    publicKey,
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    fee,
    nonce,
    sponsored,
    anchorMode = 'any',
    postConditionMode = 'deny',
    postConditions = [],
    validateWithAbi,
  } = options;

  assertValidAddress(contractAddress);

  const txOptions: Parameters<typeof makeUnsignedContractCall>[0] = {
    publicKey,
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    anchorMode,
    postConditionMode: toNativePostConditionMode(postConditionMode),
    postConditions: toNativePostConditions(postConditions),
    network: config.network,
  };

  if (fee !== undefined) {
    txOptions.fee = fee;
  }

  if (nonce !== undefined) {
    txOptions.nonce = nonce;
  }

  if (sponsored !== undefined) {
    txOptions.sponsored = sponsored;
  }

  if (validateWithAbi !== undefined) {
    txOptions.validateWithAbi = validateWithAbi;
  }

  return txFactory(txOptions);
}

/**
 * Broadcasts a signed transaction and normalizes the result shape.
 */
export async function broadcastSignedTransaction(
  config: StacksConfig,
  transaction: StacksTransaction,
  attachment?: Uint8Array,
  broadcaster: typeof broadcastTransaction = broadcastTransaction
): Promise<BroadcastResult> {
  const result = await broadcaster(transaction, config.network, attachment);

  if ('error' in result && result.error) {
    return {
      txId: result.txid,
      success: false,
      error: result.error,
    };
  }

  return {
    txId: result.txid,
    success: true,
  };
}

/**
 * Broadcasts a signed transaction and throws on failure.
 */
export async function broadcastSignedTransactionOrThrow(
  config: StacksConfig,
  transaction: StacksTransaction,
  attachment?: Uint8Array,
  broadcaster: typeof broadcastTransaction = broadcastTransaction
): Promise<string> {
  const result = await broadcastSignedTransaction(
    config,
    transaction,
    attachment,
    broadcaster
  );

  if (!result.success) {
    throw new BroadcastFailedError(result.error ?? 'Transaction broadcast failed');
  }

  return result.txId;
}

/**
 * Creates a safe server action wrapper with normalized success/error results.
 */
export function createServerAction<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput> | TOutput,
  options: CreateServerActionOptions = {}
): (input: TInput) => Promise<ServerActionResult<TOutput>> {
  const { exposeStack = false } = options;

  return async (input: TInput): Promise<ServerActionResult<TOutput>> => {
    try {
      const data = await handler(input);
      return {
        ok: true,
        data,
      };
    } catch (error) {
      if (error instanceof StacksNextError) {
        const details: ServerActionFailure['error'] = {
          message: error.message,
          code: error.code,
        };

        if (exposeStack && error.stack) {
          details.stack = error.stack;
        }

        return {
          ok: false,
          error: details,
        };
      }

      const message =
        error instanceof Error ? error.message : 'Unexpected server action error';

      const details: ServerActionFailure['error'] = {
        message,
      };

      if (exposeStack && error instanceof Error && error.stack) {
        details.stack = error.stack;
      }

      return {
        ok: false,
        error: details,
      };
    }
  };
}
