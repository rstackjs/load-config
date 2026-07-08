import { join } from 'node:path';
import { expect, test } from 'rstack/test';
import { loadConfig } from '../../src/index';

const __dirname = import.meta.dirname;
const configPath = join(__dirname, 'demo.config.mjs');
const depPath = join(__dirname, 'dep.mjs');

test('fresh reloads bypass module cache and report relative dependencies', async () => {
  Reflect.deleteProperty(globalThis, '__freshConfigCount');
  Reflect.deleteProperty(globalThis, '__freshDependencyCount');

  const cached = await loadConfig<{ configEvaluations: number }>({
    path: configPath,
  });
  const stillCached = await loadConfig<{ configEvaluations: number }>({
    path: configPath,
  });
  const fresh = await loadConfig<{ configEvaluations: number }>({
    path: configPath,
    fresh: true,
  });
  const fresher = await loadConfig<{ configEvaluations: number }>({
    path: configPath,
    fresh: true,
  });

  expect(stillCached.content).toEqual(cached.content);
  expect(cached.dependencies).toEqual([]);
  expect(fresh.content.configEvaluations).toBe(
    cached.content.configEvaluations + 1,
  );
  expect(fresher.content.configEvaluations).toBe(
    fresh.content.configEvaluations + 1,
  );
  expect(fresh.dependencies).toEqual([depPath]);
  expect(fresher.dependencies).toEqual([depPath]);
});
