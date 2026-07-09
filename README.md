# @rstackjs/load-config

<p>
  <a href="https://npmjs.com/package/@rstackjs/load-config">
   <img src="https://img.shields.io/npm/v/@rstackjs/load-config?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@rstackjs/load-config?minimal=true"><img src="https://img.shields.io/npm/dm/@rstackjs/load-config.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

A config loading utility for the Rstack ecosystem, designed for loading JavaScript and TypeScript config files for projects like Rspack and Rsbuild.

## Installation

```bash
# pnpm
pnpm add @rstackjs/load-config -D
# yarn
yarn add @rstackjs/load-config -D
# npm
npm add @rstackjs/load-config -D
# bun
bun add @rstackjs/load-config -D
```

[jiti](https://github.com/unjs/jiti) is an optional peer dependency. Install it only when you use the `jiti` or `auto` loaders:

```bash
# pnpm
pnpm add jiti -D
# yarn
yarn add jiti -D
# npm
npm add jiti -D
# bun
bun add jiti -D
```

## Usage

```ts
import { loadConfig } from '@rstackjs/load-config';

const result = await loadConfig<{ name: string }>({
  cwd: process.cwd(),
  configFileNames: ['my-tool.config.ts', 'my-tool.config.mjs'],
});

console.log(result.content);
console.log(result.filePath);
```

Given a config file:

```ts
// my-tool.config.ts
export default {
  name: 'my-tool',
};
```

`loadConfig` returns:

```ts
type LoadConfigResult<Config = unknown> = {
  content: Config;
  filePath: string | null;
  dependencies: string[];
};
```

If no config file is found, `content` is an empty object, `filePath` is `null`, and `dependencies` is an empty array.

## Supported Exports

Default object export:

```ts
export default {
  name: 'my-tool',
};
```

Function export:

```ts
export default ({ mode }) => {
  return { mode };
};
```

Async function export:

```ts
export default async ({ mode }) => {
  return { mode };
};
```

## API

### loadConfig

```ts
function loadConfig<Config = unknown, Params extends unknown[] = []>(
  options?: LoadConfigOptions<Params>,
): Promise<LoadConfigResult<Config>>;
```

### Options

#### cwd

The root directory used to resolve config files.

- Type: `string`
- Default: `process.cwd()`

#### path

A relative or absolute path to a specific config file.

- Type: `string`
- Default: `undefined`

When `path` is provided, the file must exist. Relative paths are resolved from `cwd`.

```ts
await loadConfig({
  path: path.join(import.meta.dirname, 'custom.config.ts'),
});
```

#### configFileNames

A list of file names to search in `cwd` when `path` is not provided.

- Type: `string[]`
- Default: `[]`

```ts
await loadConfig({
  configFileNames: [
    'tool.config.ts',
    'tool.config.mts',
    'tool.config.js',
    'tool.config.mjs',
  ],
});
```

#### loader

Controls how the config file is loaded.

- Type: `'auto' | 'jiti' | 'native'`
- Default: `'auto'`

`auto` uses the native loader when possible and falls back to `jiti`.

JavaScript config files (`.js`, `.mjs`, `.cjs`) are always attempted with native dynamic import first; if native import fails and `loader` is not `native`, they fall back to `jiti`.

TypeScript config files use the native loader in runtimes with TypeScript support, Bun, or Deno; otherwise they use `jiti`.

Set `loader` to `native` to disable the `jiti` fallback.

```ts
await loadConfig({
  path: 'tool.config.ts',
  loader: 'native',
});
```

#### exportName

The export to read from the config module.

- Type: `string | false`
- Default: `'default'`

Use a string to read a named export:

```ts
// tool.config.ts
export const config = {
  name: 'my-tool',
};
```

```ts
await loadConfig({
  path: 'tool.config.ts',
  exportName: 'config',
});
```

Set `exportName` to `false` to execute the config file without reading exports. The returned `content` is an empty object.

#### configParams

Arguments passed to a function config export.

- Type: `Params`
- Default: `[]`

```ts
// tool.config.ts
export default ({ mode }: { mode: string }) => ({
  mode,
});
```

```ts
const result = await loadConfig<{ mode: string }, [{ mode: string }]>({
  path: 'tool.config.ts',
  configParams: [{ mode: 'production' }],
});
```

Config functions may be async, but they must return a config object.

#### fresh

Bypasses module cache when loading the config.

- Type: `boolean`
- Default: `false`

```ts
await loadConfig({
  path: 'tool.config.mjs',
  fresh: true,
});
```

When using the `native` loader and `fresh` is enabled, `dependencies` contains absolute paths for files imported by the config file.

## License

[MIT](./LICENSE).
