import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig, withConfigMeta } from '../../src/index';

const configPath = join(import.meta.dirname, 'adapter.config.ts');
const sourcePath = join(import.meta.dirname, 'actual.config.mjs');
const dependencyPath = join(import.meta.dirname, 'shared.mjs');

const load = (exportName: string | false) =>
  loadConfig({ path: configPath, exportName });

test('attaches metadata in place without changing enumerable fields', () => {
  const config = { name: 'app' };
  const result = withConfigMeta(config, { filePath: sourcePath });

  expect(result).toBe(config);
  expect(Object.keys(result)).toEqual(['name']);
  expect(JSON.stringify(result)).toBe('{"name":"app"}');
  expect(Object.getOwnPropertySymbols({ ...result })).toEqual([]);
});

test.each(['native', 'jiti'] as const)(
  '%s: loads metadata from config exports',
  async (loader) => {
    for (const [exportName, name] of [
      ['default', 'shared'],
      ['sync', 'from params'],
      ['asyncConfig', 'from params'],
    ]) {
      const result = await loadConfig({
        path: configPath,
        loader,
        exportName,
        configParams: ['from params'],
      });

      expect(result).toEqual({
        content: { name },
        filePath: sourcePath,
        dependencies: [dependencyPath, configPath],
      });
    }
  },
);

test('preserves null sources and omitted dependencies', async () => {
  expect(await load('missing')).toEqual({
    content: {},
    filePath: null,
    dependencies: [configPath],
  });
});

test('ignores ordinary metadata-like fields and disabled exports', async () => {
  expect(await load('ordinary')).toEqual({
    content: { content: 'ordinary', filePath: 'ordinary', dependencies: [] },
    filePath: configPath,
    dependencies: [],
  });
  expect(await load(false)).toEqual({
    content: {},
    filePath: configPath,
    dependencies: [],
  });
});

test('merges collected dependencies across fresh helper instances', async () => {
  const result = await loadConfig({ path: configPath, fresh: true });

  expect(result).toEqual({
    content: { name: 'shared' },
    filePath: sourcePath,
    dependencies: [
      dependencyPath,
      configPath,
      join(import.meta.dirname, '../../src/meta.ts'),
      sourcePath,
    ],
  });
});
