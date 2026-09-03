export function linesToArray(s: string): string[] {
  return s
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
