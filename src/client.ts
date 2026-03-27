/**
 * @yusufolosun/stacks-next/client
 *
 * Client-side entry point for React components, hooks, and browser utilities.
 *
 * NOTE: When using React hooks from this module in Next.js App Router,
 * add 'use client' directive at the top of your component file.
 *
 * @example
 * ```typescript
 * 'use client';
 *
 * import {
 *   createStacksConfig,
 *   isValidStacksAddress,
 *   // Additional React hooks and components may arrive in future minor releases
 * } from '@yusufolosun/stacks-next/client';
 * ```
 *
 * @packageDocumentation
 */

// Re-export all universal utilities
export * from './index';

// Client-specific exports will be added in future minor releases.
// Examples:
// - StacksProvider (React context provider)
// - useConnect (wallet connection hook)
// - useStacksAccount (account info hook)
// - useContractRead (read-only contract call hook)
// - useContractWrite (transaction hook)
// - useTransaction (transaction status hook)
// - useBnsName (BNS resolution hook)
// - useSbtcBalance (sBTC balance hook)
