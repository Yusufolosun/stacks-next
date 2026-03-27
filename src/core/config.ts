/**
 * Configuration module for @yusufolosun/stacks-next
 *
 * Provides factory functions for creating Stacks network configurations.
 */

import {
  StacksMainnet,
  StacksTestnet,
  StacksDevnet,
  type StacksNetwork,
} from '@stacks/network';
import type { NetworkType, StacksConfig } from './types';
import { NETWORK_URLS } from './constants';
import { InvalidNetworkError } from './errors';

/**
 * Options for creating a Stacks configuration
 */
export interface CreateStacksConfigOptions {
  /**
   * Network type: 'mainnet', 'testnet', or 'devnet'
   */
  network: NetworkType;

  /**
   * Custom API URL (optional)
   * If not provided, default Hiro API URLs will be used
   */
  apiUrl?: string | undefined;
}

/**
 * Creates a Stacks network configuration
 *
 * @example
 * ```typescript
 * // Mainnet with default Hiro API
 * const config = createStacksConfig({ network: 'mainnet' });
 *
 * // Testnet with custom API
 * const config = createStacksConfig({
 *   network: 'testnet',
 *   apiUrl: 'https://my-custom-api.com'
 * });
 * ```
 */
export function createStacksConfig(
  options: CreateStacksConfigOptions
): StacksConfig {
  const { network, apiUrl } = options;

  if (!['mainnet', 'testnet', 'devnet'].includes(network)) {
    throw new InvalidNetworkError(network);
  }

  const defaultApiUrl = NETWORK_URLS[network];
  const finalApiUrl = apiUrl ?? defaultApiUrl;

  let stacksNetwork: StacksNetwork;

  switch (network) {
    case 'mainnet':
      stacksNetwork = new StacksMainnet({ url: finalApiUrl });
      break;
    case 'testnet':
      stacksNetwork = new StacksTestnet({ url: finalApiUrl });
      break;
    case 'devnet':
      stacksNetwork = new StacksDevnet({ url: finalApiUrl });
      break;
    default:
      throw new InvalidNetworkError(network);
  }

  return {
    network: stacksNetwork,
    apiUrl: finalApiUrl,
    networkType: network,
  };
}

/**
 * Creates a Stacks configuration from environment variables
 *
 * Expected environment variables:
 * - `NEXT_PUBLIC_STACKS_NETWORK` or `STACKS_NETWORK`: Network type ('mainnet', 'testnet', 'devnet')
 * - `NEXT_PUBLIC_STACKS_API_URL` or `STACKS_API_URL`: Custom API URL (optional)
 *
 * @example
 * ```typescript
 * // .env.local
 * // NEXT_PUBLIC_STACKS_NETWORK=testnet
 * // NEXT_PUBLIC_STACKS_API_URL=https://my-api.com
 *
 * const config = getConfigFromEnv();
 * ```
 */
export function getConfigFromEnv(): StacksConfig {
  const network =
    (process.env['NEXT_PUBLIC_STACKS_NETWORK'] as NetworkType | undefined) ??
    (process.env['STACKS_NETWORK'] as NetworkType | undefined) ??
    'testnet';

  const apiUrl =
    process.env['NEXT_PUBLIC_STACKS_API_URL'] ?? process.env['STACKS_API_URL'];

  return createStacksConfig({ network, apiUrl });
}

/**
 * Checks if a network is mainnet
 */
export function isMainnet(config: StacksConfig): boolean {
  return config.networkType === 'mainnet';
}

/**
 * Checks if a network is testnet
 */
export function isTestnet(config: StacksConfig): boolean {
  return config.networkType === 'testnet';
}

/**
 * Checks if a network is devnet
 */
export function isDevnet(config: StacksConfig): boolean {
  return config.networkType === 'devnet';
}
