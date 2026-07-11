globalThis.__freshErrorCount = (globalThis.__freshErrorCount ?? 0) + 1;

throw new Error('test config error');
