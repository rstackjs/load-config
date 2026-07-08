import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('loads configs with the jiti loader', async () => {
  const result = await loadConfig<{ loader: string }>({
    cwd: __dirname,
    path: 'demo.config.ts',
    loader: 'jiti',
  });

  expect(result.content).toEqual({ loader: 'jiti' });
});
