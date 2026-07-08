export default async ({ mode }, count) => ({
  mode,
  count,
  label: `${mode}-${count}`,
});
