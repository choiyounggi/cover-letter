export function safeCallbackUrl(raw: string | string[] | undefined, fallback = "/admin"): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}
