import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('returns an empty result when no config file is found', async () => {
  const result = await loadConfig({
    cwd: __dirname,
    configFileNames: ['missing.config.mjs'],
  });

  expect(result).toEqual({
    content: {},
    filePath: null,
    dependencies: [],
  });
});
