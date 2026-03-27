/**
 * @yusufolosun/stacks-next/server
 *
 * Server-side entry point for Next.js Server Actions, caching, and secure operations.
 * This module should only be imported in server components, route handlers, or server actions.
 *
 * SECURITY: Never import this module in client components or expose server-side
 * functionality to the browser.
 *
 * @example
 * ```typescript
 * // app/actions/transfer.ts
 * 'use server';
 *
 * import {
 *   createStacksConfig,
 *   // Server-side utilities will be added in later phases
 * } from '@yusufolosun/stacks-next/server';
 *
 * export async function transferStx(recipient: string, amount: bigint) {
 *   const config = createStacksConfig({ network: 'mainnet' });
 *   // ... secure server-side transaction building
 * }
 * ```
 *
 * @packageDocumentation
 */

// Re-export all universal utilities
export * from './index';

// Server-side transaction utilities
export {
	buildUnsignedStxTransfer,
	buildUnsignedContractCall,
	broadcastSignedTransaction,
	broadcastSignedTransactionOrThrow,
	createServerAction,
} from './server/transactions';
export type {
	BuildUnsignedStxTransferOptions,
	BuildUnsignedContractCallOptions,
	CreateServerActionOptions,
	ServerActionFailure,
	ServerActionSuccess,
	ServerActionResult,
} from './server/transactions';

// ABI-aware contract read client
export {
	fetchContractAbi,
	createContractReadClient,
} from './server/contractClient';
export type {
	ReadOnlyCallResult,
	ContractReadClient,
	CreateContractReadClientOptions,
} from './server/contractClient';
