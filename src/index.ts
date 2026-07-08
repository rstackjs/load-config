import fs from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export type ConfigLoader = 'auto' | 'jiti' | 'native';

type ConfigFunction<Config, Params extends unknown[]> = (
  ...params: Params
) => Config | Promise<Config>;

export type ConfigDefinition<Config, Params extends unknown[]> =
  Config | ConfigFunction<Config, Params>;

export type LoadConfigOptions<Params extends unknown[] = []> = {
  /**
   * The root path to resolve the config file.
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * The path to the config file, can be a relative or absolute path.
   * If `path` is not provided, the function will search for the config file in the `cwd`.
   */
  path?: string;
  /**
   * Config file names to search in `cwd` when `path` is not provided.
   * The package-level loader has no built-in framework defaults.
   * @default []
   */
  configFileNames?: string[];
  /**
   * Specify the config loader, can be `auto`, `jiti` or `native`.
   * @default 'auto'
   */
  loader?: ConfigLoader;
  /**
   * The export name to read from the config file.
   * Set to `false` to execute the config file without reading exports.
   * @default 'default'
   */
  exportName?: string | false;
  /**
   * Arguments passed to a function config export.
   * @default []
   */
  configParams?: Params;
  /**
   * Whether to bypass module cache when loading the config.
   * @default false
   */
  fresh?: boolean;
};

export type LoadConfigResult<Config = unknown> = {
  /**
   * The loaded configuration object.
   */
  content: Config;
  /**
   * The path to the loaded configuration file.
   * Return `null` if the configuration file is not found.
   */
  filePath: string | null;
  /**
   * Absolute file paths of statically imported (relative) dependencies of the
   * config file.
   */
  dependencies: string[];
};

type LoadedConfig<Config, Params extends unknown[]> = {
  configExport: ConfigDefinition<Config, Params>;
  dependencies: string[];
};

const JS_CONFIG_EXTENSION_REGEXP = /\.(?:js|mjs|cjs)$/;

const resolveConfigPath = (
  root: string,
  customConfig?: string,
  configFileNames: string[] = [],
) => {
  if (customConfig) {
    const customConfigPath = isAbsolute(customConfig)
      ? customConfig
      : join(root, customConfig);
    if (fs.existsSync(customConfigPath)) {
      return customConfigPath;
    }
    throw new Error(`Cannot find config file: ${customConfigPath}`);
  }

  for (const file of configFileNames) {
    const configFile = join(root, file);

    if (fs.existsSync(configFile)) {
      return configFile;
    }
  }

  return null;
};

const canReadExport = (module: unknown): module is Record<string, unknown> =>
  module !== null &&
  (typeof module === 'object' || typeof module === 'function');

const isConfigFunction = <Config, Params extends unknown[]>(
  configExport: ConfigDefinition<Config, Params>,
): configExport is ConfigFunction<Config, Params> =>
  typeof configExport === 'function';

const getConfigExport = <Config, Params extends unknown[]>(
  configModule: unknown,
  exportName: string | false,
  configFilePath: string,
): ConfigDefinition<Config, Params> => {
  if (exportName === false) {
    return {} as ConfigDefinition<Config, Params>;
  }

  if (exportName === 'default') {
    return (
      canReadExport(configModule) && 'default' in configModule
        ? configModule.default
        : configModule
    ) as ConfigDefinition<Config, Params>;
  }

  if (canReadExport(configModule) && Object.hasOwn(configModule, exportName)) {
    return configModule[exportName] as ConfigDefinition<Config, Params>;
  }

  throw new Error(
    `Cannot find export ${exportName} in config file: ${configFilePath}`,
  );
};

const tryFreshImport = async (configFileURL: string) => {
  try {
    const { freshImport } = await import('fresh-import');
    return await freshImport(configFileURL);
  } catch {
    //
  }
};

const loadConfigWithNative = async (
  configFilePath: string,
  fresh: boolean,
): Promise<{
  configModule: unknown;
  dependencies: string[];
}> => {
  const configFileURL = pathToFileURL(configFilePath).href;

  if (!fresh) {
    const configModule = await import(configFileURL);
    return {
      configModule,
      dependencies: [],
    };
  }

  const freshImportResult = await tryFreshImport(configFileURL);

  if (freshImportResult) {
    return {
      configModule: freshImportResult.result,
      dependencies: freshImportResult.dependencies.sort(),
    };
  }

  const configModule = await import(`${configFileURL}?t=${Date.now()}`);
  return {
    configModule,
    dependencies: [],
  };
};

const loadConfigWithJiti = async <Config, Params extends unknown[]>(
  configFilePath: string,
  exportName: string | false,
  fresh: boolean,
): Promise<LoadedConfig<Config, Params>> => {
  const { createJiti } = await import('jiti');
  const jiti = createJiti(configFilePath, {
    moduleCache: !fresh,
    interopDefault: true,
    nativeModules: ['typescript'],
  });

  if (exportName === 'default') {
    return {
      configExport: await jiti.import<ConfigDefinition<Config, Params>>(
        configFilePath,
        {
          default: true,
        },
      ),
      dependencies: [],
    };
  }

  const configModule = await jiti.import<unknown>(configFilePath);
  return {
    configExport: getConfigExport<Config, Params>(
      configModule,
      exportName,
      configFilePath,
    ),
    dependencies: [],
  };
};

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
  const configFilePath = resolveConfigPath(cwd, path, configFileNames);

  if (!configFilePath) {
    return {
      content: {} as Config,
      filePath: configFilePath,
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

  if (useNative || JS_CONFIG_EXTENSION_REGEXP.test(configFilePath)) {
    let result: Awaited<ReturnType<typeof loadConfigWithNative>> | undefined;
    try {
      result = await loadConfigWithNative(configFilePath, fresh);
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
          configFilePath,
        ),
        dependencies: result.dependencies,
      };
    }
  }

  if (!loadedConfig) {
    loadedConfig = await loadConfigWithJiti<Config, Params>(
      configFilePath,
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
      filePath: configFilePath,
      dependencies,
    };
  }

  return {
    content: configExport,
    filePath: configFilePath,
    dependencies,
  };
}
