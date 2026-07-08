import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('throws when function config returns undefined', async () => {
  await expect(
    loadConfig({
      cwd: __dirname,
      path: 'demo.config.mjs',
    }),
  ).rejects.toThrow('The config function must return a config object.');
});
