import { afterEach, expect, test } from 'rstack/test';
import { loadConfig, setJitiLoader } from '../../src/index';

const load = () =>
  loadConfig({
    cwd: import.meta.dirname,
    path: 'demo.config.ts',
    loader: 'jiti',
    fresh: true,
  });

afterEach(() => {
  setJitiLoader(() => import('jiti'));
});

test('replaces the cached importer and loads jiti lazily once for concurrent configs', async () => {
  await load();

  let imports = 0;
  setJitiLoader(async () => {
    imports++;
    return import('jiti');
  });

  expect(imports).toBe(0);
  await loadConfig({
    cwd: import.meta.dirname,
    path: '../basic/demo.config.mjs',
    loader: 'auto',
  });
  expect(imports).toBe(0);

  const results = await Promise.all([load(), load()]);
  expect(results.map(({ content }) => content)).toEqual([
    { loader: 'jiti' },
    { loader: 'jiti' },
  ]);
  expect(imports).toBe(1);
});

test('retries an injected importer after it rejects', async () => {
  const error = new Error('failed to import bundled jiti');
  let imports = 0;
  setJitiLoader(async () => {
    if (++imports === 1) {
      throw error;
    }
    return import('jiti');
  });

  await expect(load()).rejects.toMatchObject({ cause: error });
  expect((await load()).content).toEqual({ loader: 'jiti' });
  expect(imports).toBe(2);
});
