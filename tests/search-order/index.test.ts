import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('uses the first matching configured file name', async () => {
  const result = await loadConfig<{ name: string }>({
    cwd: __dirname,
    configFileNames: [
      'missing.config.mjs',
      'second.config.mjs',
      'first.config.mjs',
    ],
  });

  expect(result.content).toEqual({ name: 'second' });
  expect(result.filePath).toBe(join(__dirname, 'second.config.mjs'));
});
