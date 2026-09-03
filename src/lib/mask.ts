export function maskSecret(value: string): string {
  if (!value) return "";
  return `••••${value.slice(-4)}`;
}
