/**
 * Custom error classes for @yusufolosun/stacks-next
 *
 * These errors provide better context and type safety for error handling.
 */

import { ERROR_CODES } from "./constants";

/**
 * Base error class for all stacks-next errors
 */
export class StacksNextError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = "StacksNextError";
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, StacksNextError.prototype);
  }
}

/**
 * Invalid address error
 */
export class InvalidAddressError extends StacksNextError {
  constructor(address: string, details?: unknown) {
    super(
      `Invalid Stacks address: ${address}`,
      ERROR_CODES.INVALID_ADDRESS,
      details,
    );
    this.name = "InvalidAddressError";
    Object.setPrototypeOf(this, InvalidAddressError.prototype);
  }
}

/**
 * Invalid network error
 */
export class InvalidNetworkError extends StacksNextError {
  constructor(network: string, details?: unknown) {
    super(
      `Invalid network: ${network}. Must be 'mainnet', 'testnet', or 'devnet'`,
      ERROR_CODES.INVALID_NETWORK,
      details,
    );
    this.name = "InvalidNetworkError";
    Object.setPrototypeOf(this, InvalidNetworkError.prototype);
  }
}

/**
 * Invalid amount error
 */
export class InvalidAmountError extends StacksNextError {
  constructor(amount: string | number | bigint, details?: unknown) {
    super(
      `Invalid amount: ${amount}. Amount must be a positive non-zero value`,
      ERROR_CODES.INVALID_AMOUNT,
      details,
    );
    this.name = "InvalidAmountError";
    Object.setPrototypeOf(this, InvalidAmountError.prototype);
  }
}

/**
 * Invalid fee error
 */
export class InvalidFeeError extends StacksNextError {
  constructor(fee: string | number | bigint, details?: unknown) {
    super(
      `Invalid fee: ${fee}. Fee must be within acceptable range`,
      ERROR_CODES.INVALID_FEE,
      details,
    );
    this.name = "InvalidFeeError";
    Object.setPrototypeOf(this, InvalidFeeError.prototype);
  }
}

/**
 * Invalid nonce error
 */
export class InvalidNonceError extends StacksNextError {
  constructor(nonce: number, details?: unknown) {
    super(
      `Invalid nonce: ${nonce}. Nonce must be a non-negative integer`,
      ERROR_CODES.INVALID_NONCE,
      details,
    );
    this.name = "InvalidNonceError";
    Object.setPrototypeOf(this, InvalidNonceError.prototype);
  }
}

/**
 * Invalid contract error
 */
export class InvalidContractError extends StacksNextError {
  constructor(contractId: string, details?: unknown) {
    super(
      `Invalid contract: ${contractId}`,
      ERROR_CODES.INVALID_CONTRACT,
      details,
    );
    this.name = "InvalidContractError";
    Object.setPrototypeOf(this, InvalidContractError.prototype);
  }
}

/**
 * Invalid function error
 */
export class InvalidFunctionError extends StacksNextError {
  constructor(functionName: string, details?: unknown) {
    super(
      `Invalid function: ${functionName}`,
      ERROR_CODES.INVALID_FUNCTION,
      details,
    );
    this.name = "InvalidFunctionError";
    Object.setPrototypeOf(this, InvalidFunctionError.prototype);
  }
}

/**
 * Invalid BNS name error
 */
export class InvalidBnsNameError extends StacksNextError {
  constructor(name: string, details?: unknown) {
    super(`Invalid BNS name: ${name}`, ERROR_CODES.INVALID_BNS_NAME, details);
    this.name = "InvalidBnsNameError";
    Object.setPrototypeOf(this, InvalidBnsNameError.prototype);
  }
}

/**
 * Invalid BNS namespace error
 */
export class InvalidBnsNamespaceError extends StacksNextError {
  constructor(namespace: string, details?: unknown) {
    super(
      `Invalid BNS namespace: ${namespace}`,
      ERROR_CODES.INVALID_BNS_NAMESPACE,
      details,
    );
    this.name = "InvalidBnsNamespaceError";
    Object.setPrototypeOf(this, InvalidBnsNamespaceError.prototype);
  }
}

/**
 * Invalid transaction memo error
 */
export class InvalidMemoError extends StacksNextError {
  constructor(memo: string, details?: unknown) {
    super(`Invalid memo: ${memo}`, ERROR_CODES.INVALID_MEMO, details);
    this.name = "InvalidMemoError";
    Object.setPrototypeOf(this, InvalidMemoError.prototype);
  }
}

/**
 * Transaction failed error
 */
export class TransactionFailedError extends StacksNextError {
  public readonly txId?: string | undefined;

  constructor(message: string, txId?: string, details?: unknown) {
    super(message, ERROR_CODES.TRANSACTION_FAILED, details);
    this.name = "TransactionFailedError";
    this.txId = txId;
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}

/**
 * Broadcast failed error
 */
export class BroadcastFailedError extends StacksNextError {
  constructor(message: string, details?: unknown) {
    super(message, ERROR_CODES.BROADCAST_FAILED, details);
    this.name = "BroadcastFailedError";
    Object.setPrototypeOf(this, BroadcastFailedError.prototype);
  }
}

/**
 * Signature verification failed error
 */
export class SignatureVerificationError extends StacksNextError {
  constructor(message: string, details?: unknown) {
    super(message, ERROR_CODES.SIGNATURE_VERIFICATION_FAILED, details);
    this.name = "SignatureVerificationError";
    Object.setPrototypeOf(this, SignatureVerificationError.prototype);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends StacksNextError {
  constructor(message = "Unauthorized access", details?: unknown) {
    super(message, ERROR_CODES.UNAUTHORIZED, details);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends StacksNextError {
  public readonly resource: string;

  constructor(resource: string, details?: unknown) {
    super(`Resource not found: ${resource}`, ERROR_CODES.NOT_FOUND, details);
    this.name = "NotFoundError";
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * API error
 */
export class ApiError extends StacksNextError {
  public readonly statusCode?: number | undefined;
  public readonly url?: string | undefined;

  constructor(
    message: string,
    statusCode?: number,
    url?: string,
    details?: unknown,
  ) {
    super(message, ERROR_CODES.API_ERROR, details);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.url = url;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Network error
 */
export class NetworkError extends StacksNextError {
  constructor(message: string, details?: unknown) {
    super(message, ERROR_CODES.NETWORK_ERROR, details);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
