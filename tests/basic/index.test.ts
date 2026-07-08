import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should load default config from configured file names', async () => {
  const result = await loadConfig<{ name: string }>({
    cwd: __dirname,
    configFileNames: ['demo.config.mjs'],
  });

  expect(result.content).toEqual({ name: 'test' });
  expect(result.filePath).toBe(join(__dirname, 'demo.config.mjs'));
  expect(result.dependencies).toEqual([]);
});
