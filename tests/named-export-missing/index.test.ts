import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('throws when the requested named export does not exist', async () => {
  await expect(
    loadConfig({
      cwd: __dirname,
      path: 'demo.config.mjs',
      exportName: 'missing',
    }),
  ).rejects.toThrow(
    `Cannot find export missing in config file: ${join(__dirname, 'demo.config.mjs')}`,
  );
});
