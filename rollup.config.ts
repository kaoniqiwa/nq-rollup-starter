import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
// del 是纯 ESM 包（rollup-plugin-delete@3 只有 exports.default）。
import del from 'rollup-plugin-delete';

import { createRequire } from 'node:module';
import { defineConfig } from 'rollup';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const input = 'src/main.ts';

// 构建用 tsconfig：rootDir 钉在 src，并关掉了 declaration
//（声明文件由下面第三个 config 的 dts() 单独打成单文件）
const tsconfig = './tsconfig.build.json';

// 运行时依赖一律不内联，交给使用方的打包器 / Node 去解析。
// 前提：被 external 的包必须声明在 dependencies（或 peerDependencies）里，
// 否则使用者装不到，运行时会 MODULE_NOT_FOUND。
const external = Object.keys(pkg.dependencies ?? {});

export default defineConfig([
  {
    input,
    output: {
      name: 'howLongUntilLunch',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
    },
    // 顺序不能反：先解析到文件，再把它从 CJS 转成 ESM
    // dist 只在这里清一次 —— 下面三个 config 是串行构建的（rollup CLI 逐个 await），
    // del 默认挂 buildStart，放到后面两个 config 里会把前面刚写出的产物删掉。
    plugins: [del({ targets: 'dist' }), resolve(), commonjs(), typescript({ tsconfig })],
  },

  {
    input,
    external,
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true },
    ],
    plugins: [resolve(), commonjs(), typescript({ tsconfig })],
  },

  // 声明文件单独一个 config。dts() 是「声明打包器」：输入 .ts，输出单个 .d.ts，
  // 把被入口引用的类型内联进来、丢掉没被引用的。
  // 不能和 typescript()/resolve()/commonjs() 混在同一个 config 里 ——
  // 它的 transform 会把实现剥掉，JS 产物会变成 .d.ts 的内容。
  {
    input,
    output: [{ file: 'dist/how-long-till-lunch.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]);
