import path from 'node:path';
import { createRequire } from 'node:module';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';

const __dirname = import.meta.dirname;

const createdRequire = createRequire(import.meta.url);
const pkg = createdRequire('../package.json');

function resolve(_path) {
  return path.resolve(__dirname, '../', _path);
}

const banner = `/*!
  * nq-rollup-starter v${pkg.version}
  * (c) ${new Date().getFullYear()} Kaoniqiwa
  * @license ISC
  */`;

function getConfig(opts) {
  /**@type {import('rollup').InputOptions;} */
  const inputOptions = {
    input: 'src/main.ts',
    plugins: [
      commonjs(),
      nodeResolve({
        extensions: ['.js', '.ts', '.mjs', '.json'],
      }),
      typescript({ tsconfig: resolve('tsconfig.build.json') }),
      replace({
        __VERSION__: pkg.version,
        preventAssignment: true,
      }),
    ],
  };
  /**@type {import('rollup').OutputOptions;} */
  const outputOptions = {
    file: opts.file,
    format: opts.format,
    banner,
    exports: opts.exports || 'auto',
  };
  const config = {
    input: inputOptions,
    output: outputOptions,
  };
  if (['umd', 'iife'].includes(opts.format)) {
    outputOptions.name = opts.name;
    outputOptions.globals = opts.globals;
  }
  if (opts.env) {
    config.input.plugins.push(
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(opts.env),
      }),
    );
  }
  // 如果需要降级
  if (opts.transpile !== false) {
    inputOptions.plugins.push(buble());
  }

  return config;
}

export default [
  {
    file: resolve(pkg.browser),
    format: 'umd',
    name: 'howLongUntilLunch',
    globals: {
      ms: 'ms',
    },
    env: 'development',
  },
  {
    file: resolve(pkg.browser.replace(/\.js/, '.min.js')),
    format: 'umd',
    name: 'howLongUntilLunch',
    globals: {
      ms: 'ms',
    },
    env: 'production',
  },
  {
    file: resolve(pkg.main),
    format: 'cjs',
    env: 'development',
  },
  {
    file: resolve(pkg.main.replace(/\.js/, '.min.js')),
    format: 'cjs',
    env: 'production',
  },

  {
    file: resolve(pkg.module),
    format: 'es',
    env: 'development',
    transpile: false,
  },
  {
    file: resolve(pkg.module.replace(/\.js/, '.min.js')),
    format: 'es',
    env: 'production',
    transpile: false,
  },
].map(getConfig);
