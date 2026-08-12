import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

const nativeContext =
  process.platform === 'win32' ? 'D:\\a\\project' : 'D:/a/project';

test('normalizes the context field of a jiti loaded config', async () => {
  const result = await loadConfig<{ context: string; name: string }>({
    cwd: __dirname,
    path: 'demo.config.ts',
    loader: 'jiti',
  });

  expect(result.content).toEqual({ context: nativeContext, name: 'test' });
});

test('normalizes the context field of a function config', async () => {
  const result = await loadConfig<{ context: string }>({
    cwd: __dirname,
    path: 'function.config.ts',
    loader: 'jiti',
  });

  expect(result.content.context).toBe(nativeContext);
});

test('normalizes the context field of every config in an array', async () => {
  const result = await loadConfig<[{ context: string }, { name: string }]>({
    cwd: __dirname,
    path: 'multi.config.ts',
    loader: 'jiti',
  });

  expect(result.content).toEqual([
    { context: nativeContext },
    { name: 'no-context' },
  ]);
});
