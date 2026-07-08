import { pathToFileURL } from 'node:url';

type NativeLoadResult = {
  configModule: unknown;
  dependencies: string[];
};

export const JS_CONFIG_REGEXP = /\.(?:js|mjs|cjs)$/;

const tryFreshImport = async (configFileURL: string) => {
  try {
    const { freshImport } = await import(
      /* rspackChunkName: 'freshImport' */
      'fresh-import'
    );
    return await freshImport(configFileURL);
  } catch {
    //
  }
};

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
