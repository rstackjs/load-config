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

test('throws when neither path nor config file names are provided', async () => {
  await expect(loadConfig({ cwd: __dirname })).rejects.toThrow(
    'Either `path` or at least one `configFileNames` entry must be provided.',
  );

  await expect(
    loadConfig({ cwd: __dirname, configFileNames: [] }),
  ).rejects.toThrow(
    'Either `path` or at least one `configFileNames` entry must be provided.',
  );
});
