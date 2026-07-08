import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('loads a named export from the config file', async () => {
  const result = await loadConfig<{ name: string }>({
    cwd: __dirname,
    path: 'demo.config.mjs',
    exportName: 'app',
  });

  expect(result.content).toEqual({ name: 'named-export' });
});
