import { getConfigExport, isConfigFunction } from './helpers.js';
import { loadWithJiti } from './jiti.js';
import { JS_CONFIG_REGEXP, loadWithNative } from './native.js';
import { resolveConfigPath } from './resolve.js';
import type {
  LoadedConfig,
  LoadConfigOptions,
  LoadConfigResult,
} from './types.js';

export type {
  ConfigDefinition,
  ConfigLoader,
  LoadConfigOptions,
  LoadConfigResult,
} from './types.js';

export async function loadConfig<
  Config = unknown,
  Params extends unknown[] = [],
>({
  cwd = process.cwd(),
  path,
  configFileNames = [],
  loader = 'auto',
  exportName = 'default',
  configParams = [] as unknown as Params,
  fresh = false,
}: LoadConfigOptions<Params> = {}): Promise<LoadConfigResult<Config>> {
  const configPath = resolveConfigPath(cwd, path, configFileNames);

  if (!configPath) {
    return {
      content: {} as Config,
      filePath: configPath,
      dependencies: [],
    };
  }

  let loadedConfig: LoadedConfig<Config, Params> | undefined;

  const useNative = Boolean(
    loader === 'native' ||
    (loader === 'auto' &&
      (process.features.typescript ||
        process.versions.bun ||
        process.versions.deno)),
  );

  if (useNative || JS_CONFIG_REGEXP.test(configPath)) {
    let result: Awaited<ReturnType<typeof loadWithNative>> | undefined;
    try {
      result = await loadWithNative(configPath, fresh);
    } catch (err) {
      if (loader === 'native') {
        throw err;
      }
    }

    if (result) {
      loadedConfig = {
        configExport: getConfigExport<Config, Params>(
          result.configModule,
          exportName,
          configPath,
        ),
        dependencies: result.dependencies,
      };
    }
  }

  if (!loadedConfig) {
    loadedConfig = await loadWithJiti<Config, Params>(
      configPath,
      exportName,
      fresh,
    );
  }

  const { configExport, dependencies } = loadedConfig;

  if (isConfigFunction(configExport)) {
    const result = await configExport(...configParams);

    if (result === undefined) {
      throw new Error('The config function must return a config object.');
    }

    return {
      content: result,
      filePath: configPath,
      dependencies,
    };
  }

  return {
    content: configExport,
    filePath: configPath,
    dependencies,
  };
}
