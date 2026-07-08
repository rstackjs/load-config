# @rstackjs/load-config

Load JavaScript and TypeScript configuration files with a small, framework-agnostic API.

<p>
  <a href="https://npmjs.com/package/@rstackjs/load-config">
   <img src="https://img.shields.io/npm/v/@rstackjs/load-config?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@rstackjs/load-config?minimal=true"><img src="https://img.shields.io/npm/dm/@rstackjs/load-config.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Installation

```bash
npm add @rstackjs/load-config jiti
```

`jiti` is a peer dependency and is used when a config file cannot be loaded with the native runtime loader.

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
  path: 'custom.config.ts',
});
```

#### configFileNames

File names to search in `cwd` when `path` is not provided.

- Type: `string[]`
- Default: `[]`

This package has no built-in config file names. Frameworks and tools should pass their own candidates explicitly.

```ts
await loadConfig({
  configFileNames: ['tool.config.ts', 'tool.config.mjs'],
});
```

#### loader

Controls how the config file is loaded.

- Type: `'auto' | 'jiti' | 'native'`
- Default: `'auto'`

`auto` uses the native loader when possible and falls back to `jiti`. JavaScript config files (`.js`, `.mjs`, `.cjs`) are always attempted with native dynamic import first; if native import fails and `loader` is not `native`, they fall back to `jiti`. TypeScript config files use the native loader in runtimes with TypeScript support, Bun, or Deno; otherwise they use `jiti`.

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

When available from the underlying loader, `dependencies` contains absolute paths for files imported by the config file.

## Supported Exports

Default object export:

```ts
export default {
  name: 'my-tool',
};
```

Named object export:

```ts
export const config = {
  name: 'my-tool',
};
```

Function export:

```ts
export default async ({ mode }: { mode: string }) => {
  return {
    mode,
  };
};
```

## License

[MIT](./LICENSE).
