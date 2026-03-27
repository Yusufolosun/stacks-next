/**
 * BNS (Bitcoin Name System) validation and formatting utilities.
 */

import {
  BNS_NAME_MAX_LENGTH,
  BNS_NAME_MIN_LENGTH,
  BNS_NAMESPACE_MAX_LENGTH,
  BNS_NAMESPACE_MIN_LENGTH,
  PATTERNS,
} from "../constants";
import { InvalidBnsNameError, InvalidBnsNamespaceError } from "../errors";

/**
 * Normalizes a BNS label by trimming and lowercasing.
 */
export function normalizeBnsLabel(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Validates a BNS name label.
 */
export function isValidBnsName(name: string): boolean {
  if (!name || typeof name !== "string") {
    return false;
  }

  const normalized = normalizeBnsLabel(name);

  if (
    normalized.length < BNS_NAME_MIN_LENGTH ||
    normalized.length > BNS_NAME_MAX_LENGTH
  ) {
    return false;
  }

  return PATTERNS.BNS_NAME.test(normalized);
}

/**
 * Validates a BNS namespace label.
 */
export function isValidBnsNamespace(namespace: string): boolean {
  if (!namespace || typeof namespace !== "string") {
    return false;
  }

  const normalized = normalizeBnsLabel(namespace);

  if (
    normalized.length < BNS_NAMESPACE_MIN_LENGTH ||
    normalized.length > BNS_NAMESPACE_MAX_LENGTH
  ) {
    return false;
  }

  return PATTERNS.BNS_NAMESPACE.test(normalized);
}

/**
 * Asserts that a BNS name is valid.
 */
export function assertValidBnsName(name: string): asserts name is string {
  if (!isValidBnsName(name)) {
    throw new InvalidBnsNameError(name);
  }
}

/**
 * Asserts that a BNS namespace is valid.
 */
export function assertValidBnsNamespace(
  namespace: string,
): asserts namespace is string {
  if (!isValidBnsNamespace(namespace)) {
    throw new InvalidBnsNamespaceError(namespace);
  }
}

/**
 * Parses a fully-qualified BNS name (e.g., satoshi.btc).
 */
export function parseBnsName(
  fqn: string,
): { name: string; namespace: string } | null {
  if (!fqn || typeof fqn !== "string") {
    return null;
  }

  const normalized = normalizeBnsLabel(fqn);
  const firstDot = normalized.indexOf(".");

  if (firstDot <= 0 || firstDot !== normalized.lastIndexOf(".")) {
    return null;
  }

  const name = normalized.slice(0, firstDot);
  const namespace = normalized.slice(firstDot + 1);

  if (!isValidBnsName(name) || !isValidBnsNamespace(namespace)) {
    return null;
  }

  return { name, namespace };
}

/**
 * Creates a fully-qualified BNS name from labels.
 */
export function createBnsName(name: string, namespace: string): string {
  const normalizedName = normalizeBnsLabel(name);
  const normalizedNamespace = normalizeBnsLabel(namespace);

  if (!isValidBnsName(normalizedName)) {
    throw new InvalidBnsNameError(name);
  }

  if (!isValidBnsNamespace(normalizedNamespace)) {
    throw new InvalidBnsNamespaceError(namespace);
  }

  return `${normalizedName}.${normalizedNamespace}`;
}
