export function groupEventsByYear<T extends { date: Date }>(events: T[]): [number, T[]][] {
  const byYear = new Map<number, T[]>();
  for (const event of events) {
    const year = event.date.getUTCFullYear();
    const group = byYear.get(year);
    if (group) {
      group.push(event);
    } else {
      byYear.set(year, [event]);
    }
  }
  return [...byYear.entries()].sort(([a], [b]) => b - a);
}
