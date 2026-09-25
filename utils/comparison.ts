export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export function prototypePreviousValue(
  current: number,
  index: number,
  ratio = 0.94,
): number {
  const jitter = 1 + ((index * 17) % 11) * 0.008;
  return Math.round(current * ratio * jitter);
}
