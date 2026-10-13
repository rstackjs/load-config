import { afterEach, expect, rstest, test } from 'rstack/test';
import { loadConfig, setJitiLoader } from '../../src/index';

afterEach(() => {
  setJitiLoader(() => import('jiti'));
});

test('lazily imports injected jiti once for concurrent configs', async () => {
  const importer = rstest.fn(() => import('jiti'));
  setJitiLoader(importer);
  expect(importer).not.toHaveBeenCalled();

  const options = {
    cwd: import.meta.dirname,
    path: 'demo.config.ts',
    loader: 'jiti',
  } as const;
  const [result] = await Promise.all([
    loadConfig(options),
    loadConfig(options),
  ]);
  expect(result.content).toEqual({ loader: 'jiti' });
  expect(importer).toHaveBeenCalledTimes(1);
});
