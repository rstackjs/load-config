import { fileURLToPath } from 'node:url';
import { withConfigMeta } from '../../src/meta.ts';
import config from './actual.config.mjs';

const filePath = fileURLToPath(new URL('./actual.config.mjs', import.meta.url));
const dependency = fileURLToPath(new URL('./shared.mjs', import.meta.url));
const meta = { filePath, dependencies: [dependency, dependency] };

// Repeated calls replace metadata on the same object.
const result = withConfigMeta({ ...config }, { filePath: null });
withConfigMeta(result, meta);
export default result;

export const sync = (name: string) => withConfigMeta({ name }, meta);
export const asyncConfig = async (name: string) => sync(name);
export const missing = withConfigMeta({}, { filePath: null });
export const ordinary = {
  content: 'ordinary',
  filePath: 'ordinary',
  dependencies: [],
};
