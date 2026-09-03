import type { TimelineItem } from "@/lib/data";

export interface TimelineYearGroup {
  year: number;
  items: TimelineItem[];
}

/**
 * D3: pure UI-side grouping. Dates are `@db.Date` (UTC midnight), so
 * getUTCFullYear/getUTCMonth are used everywhere to stay KST-safe —
 * getFullYear/getMonth would read the local (non-UTC) calendar date and
 * could shift a date into the wrong year/month.
 */
export function groupByYear(items: TimelineItem[]): TimelineYearGroup[] {
  const byYear = new Map<number, TimelineItem[]>();
  for (const item of items) {
    const year = item.date.getUTCFullYear();
    const group = byYear.get(year);
    if (group) group.push(item);
    else byYear.set(year, [item]);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearItems]) => ({
      year,
      items: [...yearItems].sort((a, b) => b.date.getTime() - a.date.getTime()),
    }));
}

function formatYearMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

export function formatRange(start: Date, end: Date | null): string {
  const startLabel = formatYearMonth(start);
  if (end === null) return `${startLabel} – 현재`;
  const endLabel = formatYearMonth(end);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}
