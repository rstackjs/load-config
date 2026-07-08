import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('loads JavaScript configs with the native loader', async () => {
  const result = await loadConfig<{ loader: string }>({
    cwd: __dirname,
    path: 'demo.config.mjs',
    loader: 'native',
  });

  expect(result.content).toEqual({ loader: 'native' });
});
