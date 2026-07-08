import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;
const countKey = '__loadConfigExecuteOnlyCount';

test('executes the config file without reading exports', async () => {
  Reflect.deleteProperty(globalThis, countKey);

  const result = await loadConfig({
    cwd: __dirname,
    path: 'demo.config.mjs',
    exportName: false,
  });

  expect(result.content).toEqual({});
  expect(result.filePath).toBe(join(__dirname, 'demo.config.mjs'));
  expect((globalThis as Record<string, unknown>)[countKey]).toBe(1);
});
