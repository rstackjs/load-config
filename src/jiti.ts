import { cachedImport } from './cachedImport.js';
import { getConfigExport } from './helpers.js';
import type { ConfigDefinition, LoadedConfig } from './types.js';

// Keep the injection API independent of the optional jiti package's types.
type JitiLoader = () => Promise<{ createJiti: unknown }>;

let getJiti: JitiLoader = cachedImport(() => import('jiti'));

/**
 * Set the lazy jiti importer for this module instance before loading configs.
 * Replaces the cached import without invoking the new importer.
 */
export const setJitiLoader = (loader: JitiLoader): void => {
  getJiti = cachedImport(loader);
};

export const loadWithJiti = async <Config, Params extends unknown[]>(
  configPath: string,
  exportName: string | false,
  fresh: boolean,
): Promise<LoadedConfig<Config, Params>> => {
  let createJiti: (typeof import('jiti'))['createJiti'];

  try {
    ({ createJiti } = (await getJiti()) as typeof import('jiti'));
  } catch (error) {
    throw new Error(
      'The "jiti" package is required to load this config. Install it with your package manager.',
      { cause: error },
    );
  }

  const jiti = createJiti(configPath, {
    moduleCache: !fresh,
    interopDefault: true,
    nativeModules: ['typescript'],
  });

  if (exportName === 'default') {
    return {
      configExport: await jiti.import<ConfigDefinition<Config, Params>>(
        configPath,
        {
          default: true,
        },
      ),
      dependencies: [],
    };
  }

  const configModule = await jiti.import<unknown>(configPath);
  return {
    configExport: getConfigExport<Config, Params>(
      configModule,
      exportName,
      configPath,
    ),
    dependencies: [],
  };
};
