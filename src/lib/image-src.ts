/**
 * True for an absolute http(s) URL (admin-entered remote image), false for a
 * local path like "/images/a.png". Used to skip next/image's server-side
 * optimizer for remote URLs — they load directly in the browser instead, so
 * the server never fetches/decodes attacker-supplied image data.
 */
export function isRemoteSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}
