/**
 * Address validation and formatting utilities
 */

import { validateStacksAddress } from '@stacks/transactions';
import { CONTRACT_NAME_MAX_LENGTH, CONTRACT_NAME_MIN_LENGTH } from '../constants';
import { PATTERNS } from '../constants';
import { InvalidAddressError, InvalidContractError } from '../errors';
import type { StacksAddress, NetworkType } from '../types';

const CONTRACT_NAME_PATTERN = /^[a-zA-Z]([a-zA-Z0-9]|[-_])*$/;

/**
 * Validates a Stacks address format
 *
 * @param address - The address to validate
 * @returns true if the address is valid
 *
 * @example
 * ```typescript
 * isValidStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9XJ2V3'); // true
 * isValidStacksAddress('invalid'); // false
 * ```
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Validate c32 checksum and version using Stacks SDK.
  return validateStacksAddress(address);
}

/**
 * Validates a contract identifier (address.contract-name)
 *
 * @param contractId - The contract ID to validate
 * @returns true if the contract ID is valid
 *
 * @example
 * ```typescript
 * isValidContractId('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9XJ2V3.my-contract'); // true
 * ```
 */
export function isValidContractId(contractId: string): boolean {
  if (!contractId || typeof contractId !== 'string') {
    return false;
  }

  const firstDot = contractId.indexOf('.');
  if (firstDot <= 0 || firstDot !== contractId.lastIndexOf('.')) {
    return false;
  }

  const address = contractId.slice(0, firstDot);
  const contractName = contractId.slice(firstDot + 1);

  if (!isValidStacksAddress(address)) {
    return false;
  }

  if (
    contractName.length < CONTRACT_NAME_MIN_LENGTH ||
    contractName.length > CONTRACT_NAME_MAX_LENGTH
  ) {
    return false;
  }

  return CONTRACT_NAME_PATTERN.test(contractName);
}

/**
 * Validates a transaction ID
 *
 * @param txId - The transaction ID to validate
 * @returns true if the txId is valid
 *
 * @example
 * ```typescript
 * isValidTxId('0x1234...'); // true
 * ```
 */
export function isValidTxId(txId: string): boolean {
  if (!txId || typeof txId !== 'string') {
    return false;
  }
  return PATTERNS.TX_ID.test(txId);
}

/**
 * Asserts that an address is valid, throwing an error if not
 *
 * @param address - The address to validate
 * @throws InvalidAddressError if the address is invalid
 */
export function assertValidAddress(address: string): asserts address is StacksAddress {
  if (!isValidStacksAddress(address)) {
    throw new InvalidAddressError(address);
  }
}

/**
 * Shortens an address for display
 *
 * @param address - The address to shorten
 * @param chars - Number of characters to show at start and end (default: 5)
 * @returns Shortened address string
 *
 * @example
 * ```typescript
 * shortenAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9XJ2V3');
 * // Returns: 'SP2J6...XJ2V3'
 * ```
 */
export function shortenAddress(address: string, chars = 5): string {
  if (!address) {
    return '';
  }

  if (address.length <= chars * 2 + 3) {
    return address;
  }

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Formats an address with optional shortening
 *
 * @param address - The address to format
 * @param options - Formatting options
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  options: { shorten?: boolean; chars?: number } = {}
): string {
  const { shorten = false, chars = 5 } = options;

  if (!address) {
    return '';
  }

  if (shorten) {
    return shortenAddress(address, chars);
  }

  return address;
}

/**
 * Gets the network type from an address prefix
 *
 * @param address - The Stacks address
 * @returns The network type or undefined if invalid
 *
 * @example
 * ```typescript
 * getNetworkFromAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9XJ2V3'); // 'mainnet'
 * getNetworkFromAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYJ8Y87'); // 'testnet'
 * ```
 */
export function getNetworkFromAddress(address: string): NetworkType | undefined {
  if (!address || typeof address !== 'string' || address.length < 2) {
    return undefined;
  }

  if (!isValidStacksAddress(address)) {
    return undefined;
  }

  const prefix = address.slice(0, 2);

  switch (prefix) {
    case 'SP':
    case 'SM':
      return 'mainnet';
    case 'ST':
    case 'SN':
      return 'testnet';
    default:
      return undefined;
  }
}

/**
 * Checks if an address belongs to a specific network
 *
 * @param address - The address to check
 * @param network - The expected network
 * @returns true if the address belongs to the network
 */
export function isAddressForNetwork(
  address: string,
  network: NetworkType
): boolean {
  const addressNetwork = getNetworkFromAddress(address);

  if (!addressNetwork) {
    return false;
  }

  if (network === 'devnet') {
    return addressNetwork === 'testnet';
  }

  return addressNetwork === network;
}

/**
 * Parses a contract identifier into its components
 *
 * @param contractId - The contract ID (e.g., 'SP123.my-contract')
 * @returns Object with address and contractName, or null if invalid
 */
export function parseContractId(
  contractId: string
): { address: StacksAddress; contractName: string } | null {
  if (!isValidContractId(contractId)) {
    return null;
  }

  const [address, contractName] = contractId.split('.');

  if (!address || !contractName) {
    return null;
  }

  return { address, contractName };
}

/**
 * Creates a contract identifier from address and name
 *
 * @param address - The contract deployer address
 * @param contractName - The contract name
 * @returns The contract identifier
 */
export function createContractId(
  address: StacksAddress,
  contractName: string
): string {
  if (!isValidStacksAddress(address)) {
    throw new InvalidAddressError(address);
  }

  if (
    contractName.length < CONTRACT_NAME_MIN_LENGTH ||
    contractName.length > CONTRACT_NAME_MAX_LENGTH ||
    !CONTRACT_NAME_PATTERN.test(contractName)
  ) {
    throw new InvalidContractError(`${address}.${contractName}`);
  }

  return `${address}.${contractName}`;
}
