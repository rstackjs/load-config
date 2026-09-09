import type { ConfigFileMeta } from './types.js';

// Share the key across fresh imports and separately bundled copies of the loader.
const CONFIG_META = Symbol.for('@rstackjs/load-config/meta');

/**
 * Attach file metadata in place and return the original configuration object.
 * Repeated calls replace the metadata. Requires an extensible, unfrozen object.
 * Call this after merging the config: object spread does not preserve metadata.
 */
export function withConfigMeta<Config extends object>(
  config: Config,
  meta: ConfigFileMeta,
): Config {
  Object.defineProperty(config, CONFIG_META, {
    configurable: true,
    value: {
      filePath: meta.filePath,
      dependencies: [...(meta.dependencies ?? [])],
    } satisfies ConfigFileMeta,
  });

  return config;
}

export function getConfigMeta(config: unknown): ConfigFileMeta | undefined {
  if (
    config !== null &&
    typeof config === 'object' &&
    Object.hasOwn(config, CONFIG_META)
  ) {
    return (config as { [CONFIG_META]: ConfigFileMeta })[CONFIG_META];
  }
  return undefined;
}
