/**
 * Tests for server-side transaction utilities.
 */

import { describe, expect, it, vi } from 'vitest';
import { PostConditionMode, uintCV } from '@stacks/transactions';
import type { StacksTransaction } from '@stacks/transactions';
import type {
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';
import { createStacksConfig } from '../../../src/core/config';
import { InvalidMemoError } from '../../../src/core/errors';
import { createStxPostCondition } from '../../../src/core/utils/postConditions';
import {
  buildUnsignedContractCall,
  buildUnsignedStxTransfer,
  broadcastSignedTransaction,
  broadcastSignedTransactionOrThrow,
  createServerAction,
} from '../../../src/server/transactions';

const ADDRESS = 'SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4';

const fakeTx = {
  txid: () => '0xabc',
  serialize: () => Buffer.from('00', 'hex'),
} as unknown as StacksTransaction;

describe('buildUnsignedStxTransfer', () => {
  const config = createStacksConfig({ network: 'testnet' });

  it('passes normalized options into tx factory', async () => {
    const txFactoryMock = vi.fn(async () => fakeTx);
    const txFactory =
      txFactoryMock as unknown as typeof makeUnsignedSTXTokenTransfer;

    const tx = await buildUnsignedStxTransfer(
      {
        config,
        publicKey: '02a1633caf7bf9f6f8e5f9c7e2b4e80f3f6e8c7b0a7b94f047ec95bf2c98b5eb2d',
        recipient: ADDRESS,
        amount: 1000n,
        memo: 'hello',
      },
      txFactory
    );

    expect(tx).toBe(fakeTx);
    expect(txFactoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: ADDRESS,
        amount: 1000n,
        network: config.network,
        anchorMode: 'any',
      })
    );
  });

  it('throws on invalid memo length', async () => {
    await expect(
      buildUnsignedStxTransfer({
        config,
        publicKey: '02a1633caf7bf9f6f8e5f9c7e2b4e80f3f6e8c7b0a7b94f047ec95bf2c98b5eb2d',
        recipient: ADDRESS,
        amount: 1000n,
        memo: 'x'.repeat(100),
      })
    ).rejects.toThrow(InvalidMemoError);
  });
});

describe('buildUnsignedContractCall', () => {
  const config = createStacksConfig({ network: 'testnet' });

  it('maps options and native post conditions into tx factory', async () => {
    const txFactoryMock = vi.fn(async () => fakeTx);
    const txFactory =
      txFactoryMock as unknown as typeof makeUnsignedContractCall;

    const tx = await buildUnsignedContractCall(
      {
        config,
        publicKey: '02a1633caf7bf9f6f8e5f9c7e2b4e80f3f6e8c7b0a7b94f047ec95bf2c98b5eb2d',
        contractAddress: ADDRESS,
        contractName: 'my-contract',
        functionName: 'set-value',
        functionArgs: [uintCV(1)],
        postConditionMode: 'allow',
        postConditions: [createStxPostCondition(ADDRESS, 'gte', 1n)],
      },
      txFactory
    );

    expect(tx).toBe(fakeTx);
    expect(txFactoryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contractAddress: ADDRESS,
        postConditionMode: PostConditionMode.Allow,
      })
    );
  });
});

describe('broadcast helpers', () => {
  const config = createStacksConfig({ network: 'testnet' });

  it('normalizes success and failure shapes', async () => {
    const success = await broadcastSignedTransaction(
      config,
      fakeTx,
      undefined,
      vi.fn().mockResolvedValue({ txid: '0x1' })
    );

    const failure = await broadcastSignedTransaction(
      config,
      fakeTx,
      undefined,
      vi.fn().mockResolvedValue({ txid: '0x2', error: 'bad tx' })
    );

    expect(success).toEqual({ txId: '0x1', success: true });
    expect(failure).toEqual({ txId: '0x2', success: false, error: 'bad tx' });
  });

  it('throws in broadcastSignedTransactionOrThrow on rejection', async () => {
    await expect(
      broadcastSignedTransactionOrThrow(
        config,
        fakeTx,
        undefined,
        vi.fn().mockResolvedValue({ txid: '0x3', error: 'rejected' })
      )
    ).rejects.toThrow('rejected');
  });
});

describe('createServerAction', () => {
  it('returns normalized success and error results', async () => {
    const okAction = createServerAction(async (value: number) => value * 2);
    const badAction = createServerAction(async () => {
      throw new Error('boom');
    });

    await expect(okAction(5)).resolves.toEqual({ ok: true, data: 10 });

    const failure = await badAction(0);
    expect(failure.ok).toBe(false);

    if (!failure.ok) {
      expect(failure.error.message).toBe('boom');
    }
  });
});
