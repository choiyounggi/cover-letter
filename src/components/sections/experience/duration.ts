export function monthsBetween(start: Date, end: Date | null, now: Date): number {
  const effectiveEnd = end ?? now;
  const raw =
    (effectiveEnd.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (effectiveEnd.getUTCMonth() - start.getUTCMonth()) +
    1;
  return raw > 0 ? raw : 0;
}
