import { pathToFileURL } from 'node:url';

type NativeLoadResult = {
  configModule: unknown;
  dependencies: string[];
};

export const JS_CONFIG_REGEXP = /\.(?:js|mjs|cjs)$/;

export const loadWithNative = async (
  configPath: string,
  fresh: boolean,
): Promise<NativeLoadResult> => {
  const configFileURL = pathToFileURL(configPath).href;

  if (!fresh) {
    const configModule = await import(configFileURL);
    return {
      configModule,
      dependencies: [],
    };
  }

  const { freshImport } = await import(
    /* rspackChunkName: 'freshImport' */
    'fresh-import'
  );
  const freshImportResult = await freshImport(configFileURL);

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
