export function getScrollRevealDelay(index: number) {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0) * 45, 180);
}

export function parseCustomRevealDelay(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(Math.trunc(parsed), 360);
}
