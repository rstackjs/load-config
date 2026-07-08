import { dependencyEvaluations } from './dep.mjs';

globalThis.__freshConfigCount = (globalThis.__freshConfigCount ?? 0) + 1;

export default {
  configEvaluations: globalThis.__freshConfigCount,
  dependencyEvaluations,
};
