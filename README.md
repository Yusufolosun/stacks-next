# @yusufolosun/stacks-next

Production-focused TypeScript utility library for building Stacks dApps with Next.js.

## Why This Package

`@yusufolosun/stacks-next` provides a clean core of reusable Stacks utilities with strict typing, better runtime validation, and test-backed ergonomics for production apps.

## Current Capabilities

- Checksum-aware Stacks address validation
- Contract ID parsing/creation with stricter input validation
- Precision-safe STX <-> microSTX conversion utilities
- Fee estimation helpers with robust API fallback handling
- BNS utilities: normalize, validate, parse, and create names
- UTF-8-safe memo utilities with byte-length enforcement
- Deterministic block-aware cache-key helpers for contract reads
- Typed error hierarchy for safer error handling

## Installation

```bash
npm install @yusufolosun/stacks-next
```

Peer dependencies:

- `@stacks/common`
- `@stacks/connect`
- `@stacks/network`
- `@stacks/transactions`
- `next`
- `react`

## Usage

```ts
import {
  createStacksConfig,
  isValidStacksAddress,
  stxToMicroStx,
  estimateFee,
  createBnsName,
  truncateMemo,
  createContractReadCacheKey,
} from '@yusufolosun/stacks-next';

const config = createStacksConfig({ network: 'testnet' });

const addressOk = isValidStacksAddress('SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4');
const userAddress = 'SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4';
const amount = stxToMicroStx('1.25');
const fee = await estimateFee(config, { estimatedSize: 250 });

const bns = createBnsName('satoshi', 'btc');
const memo = truncateMemo('payment for order #1234');

const cacheKey = createContractReadCacheKey({
  network: 'testnet',
  contractId: 'SPJ6HB7H6NWVVR14D2PF2DBSQQG28T5CY5N5NT4.my-contract',
  functionName: 'get-balance',
  args: [userAddress],
  blockHeight: 12345,
});
```

## Development

```bash
npm run typecheck
npm run test
npm run test:coverage
npm run build
```

## Stability and Roadmap

The package is currently in early release (`0.1.x`) and is being expanded toward:

- typed contract call builders
- server-side transaction helpers
- React integrations
- additional Stacks-specific developer utilities

## License

MIT
