import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {readFileSync} from 'node:fs';

// TODO: Replace this with a regular import when ESLint adds support for import assertions.
// See: https://rollupjs.org/guide/en/#importing-packagejson
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

export const nodeResolve = resolve({
  browser: true,
  preferBuiltins: false
});

export default [{
  input: 'src/index.ts',
  output: [
    {
      file: pkg.minimized,
      name: "autocomplete",
      format: 'umd',
      sourcemap: true,
			freeze: false,
			esModule: false
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
			freeze: false
    },
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      freeze: false
    },
  ],
  plugins: [
    json(),
    terser({
      compress: {
        // eslint-disable-next-line camelcase
        pure_getters: true,
        passes: 3
      }
    }),
    nodeResolve,
    typescript(),
    commonjs({
      ignoreGlobal: true
    })
  ]
}]