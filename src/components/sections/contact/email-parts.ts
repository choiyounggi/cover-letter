import { contactEmailSchema } from "@/lib/schemas/messages";

export const EMAIL_DOMAINS = [
  "naver.com",
  "gmail.com",
  "daum.net",
  "hanmail.net",
  "kakao.com",
  "nate.com",
  "outlook.com",
] as const;

export function composeEmail(local: string, domain: string): string {
  return `${local.trim()}@${domain.trim()}`;
}

/** Returns the message to show under the email field, or null when the parts form a valid address. */
export function emailPartsError(local: string, domain: string): string | null {
  if (!local.trim() || !domain.trim()) return "이메일 아이디와 도메인을 모두 입력해 주세요.";
  return contactEmailSchema.safeParse(composeEmail(local, domain)).success ? null : "올바른 이메일 형식이 아니에요.";
}

/** A full address typed or pasted into the id field splits at its first "@"; anything else is not split. */
export function splitEmail(value: string): { local: string; domain: string } | null {
  const at = value.indexOf("@");
  if (at === -1) return null;
  return { local: value.slice(0, at), domain: value.slice(at + 1) };
}
