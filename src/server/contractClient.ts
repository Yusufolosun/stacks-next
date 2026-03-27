/**
 * ABI-aware typed contract read client scaffolding.
 */

import {
  callReadOnlyFunction,
  cvToHex,
  cvToJSON,
  cvToString,
  type ClarityAbi,
  type ClarityAbiFunction,
  type ClarityValue,
} from "@stacks/transactions";
import {
  InvalidAddressError,
  InvalidContractError,
  InvalidFunctionError,
  ApiError,
} from "../core/errors";
import type { StacksAddress, StacksConfig } from "../core/types";
import { assertValidAddress, isValidContractId } from "../core/utils/address";

type AbiFunctionName<TAbi extends ClarityAbi> =
  TAbi["functions"][number]["name"] & string;

type ReadOnlyFunctionArgs = ReadonlyArray<ClarityValue> & {
  readonly length: number;
};

export interface ReadOnlyCallResult<
  TValue extends ClarityValue = ClarityValue,
> {
  value: TValue;
  hex: string;
  repr: string;
  json: ReturnType<typeof cvToJSON>;
}

export interface ContractReadClient<TAbi extends ClarityAbi> {
  readonly abi: TAbi;
  readonly contractAddress: StacksAddress;
  readonly contractName: string;
  call<TName extends AbiFunctionName<TAbi>>(
    functionName: TName,
    args: ReadOnlyFunctionArgs,
    senderAddress?: StacksAddress,
  ): Promise<ReadOnlyCallResult>;
  methods: {
    [TName in AbiFunctionName<TAbi>]?: (
      args: ReadOnlyFunctionArgs,
      senderAddress?: StacksAddress,
    ) => Promise<ReadOnlyCallResult>;
  };
}

export interface CreateContractReadClientOptions<
  TAbi extends ClarityAbi = ClarityAbi,
> {
  config: StacksConfig;
  contractAddress: StacksAddress;
  contractName: string;
  abi?: TAbi;
  defaultSenderAddress?: StacksAddress;
  abiLoader?: (
    config: StacksConfig,
    contractAddress: StacksAddress,
    contractName: string,
  ) => Promise<TAbi>;
  readOnlyCaller?: typeof callReadOnlyFunction;
}

function isClarityAbi(value: unknown): value is ClarityAbi {
  return (
    typeof value === "object" &&
    value !== null &&
    "functions" in value &&
    Array.isArray((value as { functions?: unknown }).functions)
  );
}

/**
 * Fetches a contract ABI from the configured API endpoint.
 */
export async function fetchContractAbi(
  config: StacksConfig,
  contractAddress: StacksAddress,
  contractName: string,
  fetcher: typeof fetch = fetch,
): Promise<ClarityAbi> {
  assertValidAddress(contractAddress);

  if (!contractName) {
    throw new InvalidContractError(`${contractAddress}.${contractName}`);
  }

  const url = `${config.apiUrl}/v2/contracts/interface/${contractAddress}/${contractName}`;
  const response = await fetcher(url);

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch contract ABI: ${response.statusText}`,
      response.status,
      url,
    );
  }

  const payload: unknown = await response.json();

  const candidateAbi =
    typeof payload === "object" && payload !== null && "abi" in payload
      ? (payload as { abi: unknown }).abi
      : payload;

  if (typeof candidateAbi === "string") {
    try {
      const parsed = JSON.parse(candidateAbi) as unknown;
      if (!isClarityAbi(parsed)) {
        throw new InvalidContractError(`${contractAddress}.${contractName}`);
      }
      return parsed;
    } catch {
      throw new InvalidContractError(`${contractAddress}.${contractName}`);
    }
  }

  if (!isClarityAbi(candidateAbi)) {
    throw new InvalidContractError(`${contractAddress}.${contractName}`);
  }

  return candidateAbi;
}

function assertReadOnlyFunction(
  abi: ClarityAbi,
  functionName: string,
  expectedArgLength: number,
): ClarityAbiFunction {
  const fn = abi.functions.find((item) => item.name === functionName);

  if (!fn || fn.access !== "read_only") {
    throw new InvalidFunctionError(
      functionName,
      "Function must exist and be read_only",
    );
  }

  if (fn.args.length !== expectedArgLength) {
    throw new InvalidFunctionError(
      functionName,
      `Expected ${fn.args.length} args but received ${expectedArgLength}`,
    );
  }

  return fn;
}

/**
 * Creates an ABI-aware typed read-only contract client.
 */
export async function createContractReadClient<TAbi extends ClarityAbi>(
  options: CreateContractReadClientOptions<TAbi>,
): Promise<ContractReadClient<TAbi>> {
  const {
    config,
    contractAddress,
    contractName,
    defaultSenderAddress,
    abiLoader,
    readOnlyCaller = callReadOnlyFunction,
  } = options;

  assertValidAddress(contractAddress);

  if (
    !contractName ||
    !isValidContractId(`${contractAddress}.${contractName}`)
  ) {
    throw new InvalidContractError(`${contractAddress}.${contractName}`);
  }

  if (defaultSenderAddress && !defaultSenderAddress.trim()) {
    throw new InvalidAddressError(defaultSenderAddress);
  }

  if (defaultSenderAddress) {
    assertValidAddress(defaultSenderAddress);
  }

  const abi = options.abi
    ? options.abi
    : ((await (abiLoader ?? fetchContractAbi)(
        config,
        contractAddress,
        contractName,
      )) as TAbi);

  const call = async <TName extends AbiFunctionName<TAbi>>(
    functionName: TName,
    args: ReadOnlyFunctionArgs,
    senderAddress?: StacksAddress,
  ): Promise<ReadOnlyCallResult> => {
    const selectedSender =
      senderAddress ?? defaultSenderAddress ?? contractAddress;

    if (!selectedSender) {
      throw new InvalidAddressError(String(selectedSender));
    }

    assertValidAddress(selectedSender);

    assertReadOnlyFunction(abi, functionName, args.length);

    const value = await readOnlyCaller({
      contractAddress,
      contractName,
      functionName,
      functionArgs: [...args],
      senderAddress: selectedSender,
      network: config.network,
    });

    return {
      value,
      hex: cvToHex(value),
      repr: cvToString(value),
      json: cvToJSON(value),
    };
  };

  const readOnlyFunctions = abi.functions.filter(
    (fn) => fn.access === "read_only",
  );

  const methods = {} as ContractReadClient<TAbi>["methods"];

  for (const fn of readOnlyFunctions) {
    const functionName = fn.name as AbiFunctionName<TAbi>;
    methods[functionName] = ((args, senderAddress) =>
      call(
        functionName,
        args,
        senderAddress,
      )) as ContractReadClient<TAbi>["methods"][typeof functionName];
  }

  return {
    abi,
    contractAddress,
    contractName,
    call,
    methods,
  };
}
