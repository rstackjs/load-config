import { getConfigExport } from './helpers.js';
import type { ConfigDefinition, LoadedConfig } from './types.js';

export const loadWithJiti = async <Config, Params extends unknown[]>(
  configPath: string,
  exportName: string | false,
  fresh: boolean,
): Promise<LoadedConfig<Config, Params>> => {
  const { createJiti } = await import('jiti');
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
