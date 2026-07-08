import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('throws when a custom config path cannot be found', async () => {
  await expect(
    loadConfig({
      cwd: __dirname,
      path: 'missing.config.mjs',
    }),
  ).rejects.toThrow(
    `Cannot find config file: ${join(__dirname, 'missing.config.mjs')}`,
  );
});
