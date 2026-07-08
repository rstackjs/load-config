export type ConfigLoader = 'auto' | 'jiti' | 'native';

export type ConfigFunction<Config, Params extends unknown[]> = (
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

export type LoadedConfig<Config, Params extends unknown[]> = {
  configExport: ConfigDefinition<Config, Params>;
  dependencies: string[];
};
