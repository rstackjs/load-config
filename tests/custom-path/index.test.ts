import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('loads config from a custom relative path', async () => {
  const result = await loadConfig<{ source: string }>({
    cwd: __dirname,
    path: 'demo.config.mjs',
  });

  expect(result.content).toEqual({ source: 'relative-path' });
  expect(result.filePath).toBe(join(__dirname, 'demo.config.mjs'));
});
