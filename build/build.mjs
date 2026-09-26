import path from 'node:path';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';

import { minify } from 'terser';
import { gzip } from 'zlib';

import { rollup } from 'rollup';

import configs from './config.mjs';
import Stats from './stats.mjs';

const stats = new Stats();

/**
 *
 * @param {Config} config
 * @example
 *  直接写入磁盘
 *   rollUpBuild.write(config.output);
 */
async function buildEntry({ input, output }) {
  const { file } = output;
  const source = input.input;
  stats.time(source);

  const dir = path.basename(path.dirname(file));
  const rollUpBuild = await rollup(input);
  /**生产环境的文件需要压缩 */
  const isProd = /\.min\.js/.test(file);

  // 输出目录是否存在
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const { output: rollUpOutput } = await rollUpBuild.generate(output);

  for (const chunkOrAsset of rollUpOutput) {
    if (chunkOrAsset.type === 'asset') {
    } else if (chunkOrAsset.type === 'chunk') {
      const code = chunkOrAsset.code;
      if (isProd) {
        const minifyOutput = await minify(code, {
          toplevel: true,
          output: {
            ascii_only: true /**将 unicode 字符集收缩为 ascii 字符集 */,
          },
          compress: {
            pure_funcs: ['makeMap'],
          },
        });

        write(source, file, minifyOutput.code, true);
      } else {
        write(source, file, code);
      }
    }
  }
  rollUpBuild.close();
}

/**
 *
 * @param {string} source - chunk 对应的模块
 * @param {string} dest - 写入路径
 * @param {string} code - 写入内容
 * @param {boolean} zip - 是否gzip压缩
 */
async function write(source, dest, code, zip) {
  function report(extra) {
    console.log(
      '\n' +
        blue(source + ' → ' + path.relative(process.cwd(), dest)) +
        ' ' +
        getSize(code) +
        (extra || ''),
    );
    console.log(green(`created ${path.relative(process.cwd(), dest)} in ${stats[source]}ms`));
  }
  await writeFile(dest, code);
  stats.timeEnd(source);
  if (zip) {
    gzip(code, (err, zipped) => {
      if (err) return reject(err);
      report(' (gzipped: ' + getSize(zipped) + ')');
    });
  } else {
    report();
  }
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb';
}
/**
 * 在控制台打印特殊颜色
 * '\x1b' 为 esc 控制符的 ASCII 码，表示后面的字符为转义字符
 * '[' => 转义开始
 *  '1' => 代表加粗
 *  'm' => 转义结束
 *  '34' => 前景色蓝色
 *  '39' => 默认前景色
 *  '22' => 正常颜色
 */
function blue(str) {
  return '\x1b[1m\x1b[36m' + str + '\x1b[39m\x1b[22m';
}
function green(str) {
  return '\x1b[1m\x1b[32m' + str + '\x1b[39m\x1b[22m';
}

/**
 * @param {Error} e
 */
function logError(e) {
  console.log('\u001b[36;1m%s\u001b[0m', e.message);
}

async function build(configs) {
  for (let config of configs) {
    await buildEntry(config).catch(logError);
  }
}

build(configs);
