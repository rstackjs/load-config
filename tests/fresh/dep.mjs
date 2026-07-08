globalThis.__freshDependencyCount =
  (globalThis.__freshDependencyCount ?? 0) + 1;

export const dependencyEvaluations = globalThis.__freshDependencyCount;
