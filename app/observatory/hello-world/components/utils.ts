export const clampPercent = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));
