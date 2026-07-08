import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;

test('loads TypeScript configs with the auto loader', async () => {
  const result = await loadConfig<{ mode: string }>({
    cwd: __dirname,
    path: 'demo.config.ts',
    loader: 'auto',
  });

  expect(result.content).toEqual({ mode: 'auto-typescript' });
});
