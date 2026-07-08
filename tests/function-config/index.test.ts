import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('passes configParams to function config exports', async () => {
  const result = await loadConfig<
    { mode: string; count: number; label: string },
    [{ mode: string }, number]
  >({
    cwd: __dirname,
    path: 'demo.config.mjs',
    configParams: [{ mode: 'test' }, 2],
  });

  expect(result.content).toEqual({
    mode: 'test',
    count: 2,
    label: 'test-2',
  });
});
