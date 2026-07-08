import fs from 'node:fs';
import { isAbsolute, join } from 'node:path';

export const resolveConfigPath = (
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
