import pkg from './package.json';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

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
      format: 'umd'
    },
    {
      file: pkg.module,
      format: 'es'
    }
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