// Rstack configuration guide: https://rstack.rs/config
import { define } from 'rstack';

define.lib({
  lib: [{ syntax: 'es2023', dts: true }],
});

define.lint(async () => {
  const { js, ts } = await import('rstack/lint');
  return [js.configs.recommended, ts.configs.recommended];
});

define.fmt({
  singleQuote: true,
  ignorePatterns: ['dist/**', 'pnpm-lock.yaml'],
});

define.staged({
  '*.{md,mdx,json,css,less,scss}': 'rs fmt',
  '*.{js,jsx,ts,tsx,mjs,cjs}': ['rs lint --type-check', 'rs fmt'],
});
