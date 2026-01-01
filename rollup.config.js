import { resolve } from 'path';
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  // Main build
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'XPay',
        sourcemap: true,
        globals: {
          // Add any external dependencies here if needed
        }
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.spec.ts']
      }),
      ...(isProduction ? [terser()] : [])
    ],
    external: [
      // Add external dependencies here
      // e.g., 'crypto', 'fs', etc.
    ]
  },
  // Type declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()],
    external: [/\.css$/]
  }
]);
