import type { ConfigDefinition, ConfigFunction } from './types.js';

const canReadExport = (module: unknown): module is Record<string, unknown> =>
  module !== null &&
  (typeof module === 'object' || typeof module === 'function');

export const isConfigFunction = <Config, Params extends unknown[]>(
  configExport: ConfigDefinition<Config, Params>,
): configExport is ConfigFunction<Config, Params> =>
  typeof configExport === 'function';

export const getConfigExport = <Config, Params extends unknown[]>(
  configModule: unknown,
  exportName: string | false,
  configPath: string,
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
    `Cannot find export ${exportName} in config file: ${configPath}`,
  );
};
