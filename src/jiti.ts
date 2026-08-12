import { normalize } from 'node:path';
import { getConfigExport } from './helpers.js';
import type { ConfigDefinition, LoadedConfig } from './types.js';

type ConfigWithContext = { context: string };

const hasContext = (config: unknown): config is ConfigWithContext =>
  typeof config === 'object' &&
  config !== null &&
  typeof (config as ConfigWithContext).context === 'string';

/**
 * jiti exposes a POSIX-style `__dirname` on Windows, so a `context` built from
 * it keeps forward slashes and no longer matches the native paths the bundler
 * compares it against. Drop this once jiti stops rewriting `__dirname`.
 */
export const normalizeContext = <Config>(content: Config): Config => {
  for (const config of Array.isArray(content) ? content : [content]) {
    if (hasContext(config)) {
      config.context = normalize(config.context);
    }
  }

  return content;
};

export const loadWithJiti = async <Config, Params extends unknown[]>(
  configPath: string,
  exportName: string | false,
  fresh: boolean,
): Promise<LoadedConfig<Config, Params>> => {
  let createJiti: (typeof import('jiti'))['createJiti'];

  try {
    ({ createJiti } = await import('jiti'));
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
