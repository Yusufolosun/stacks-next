import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    server: 'src/server.ts',
    react: 'src/react/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: true,
  external: [
    'react',
    'react-dom',
    'next',
    'next-auth',
    '@stacks/common',
    '@stacks/transactions',
    '@stacks/connect',
    '@stacks/network',
  ],
});
