import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@rstest/core';
import { loadConfig } from '../../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should load default config from configured file names', async () => {
  const result = await loadConfig<{ name: string }>({
    cwd: __dirname,
    configFileNames: ['demo.config.mjs'],
  });

  expect(result.content).toEqual({ name: 'rstest' });
  expect(result.filePath).toBe(join(__dirname, 'demo.config.mjs'));
  expect(result.dependencies).toEqual([]);
});
