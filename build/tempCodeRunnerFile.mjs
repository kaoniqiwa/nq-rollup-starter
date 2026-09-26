import createRequire from 'node:module';

console.log(import.meta.dirname);

const require = createRequire(import.meta.url);