# nq-rollup-starter

## @rollup/plugin-commonjs

处理 cjs 包 ms，处理成 esm

## @rollup/plugin-node-resolve

处理 node 包导入路径解析策略

## @rollup/plugin-typescript

处理 ts 文件包括 rollup.config.ts

## @rollup/plugin-buble

语法降级

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext", // plugin-typescript 要求 必须为 es
    "moduleResolution": "Node", // 采用 Node 路径解析策略
    "allowSyntheticDefaultImports": true, // 导入 export = lodash
    "resolveJsonModule": true // 导入 json 文件
  }
}
```
