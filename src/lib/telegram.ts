export type TelegramConfig = { botToken: string; chatId: string };
export type TelegramResult = { ok: true } | { ok: false; error: string };
const TIMEOUT_MS = 5000;

export async function sendTelegramMessage(
  { botToken, chatId, text }: TelegramConfig & { text: string },
  fetchImpl: typeof fetch = fetch,
): Promise<TelegramResult> {
  if (!botToken || !chatId) return { ok: false, error: "missing-config" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (res.ok && data?.ok) return { ok: true };
    if (data?.description) return { ok: false, error: `telegram:${data.description}` };
    return { ok: false, error: `http-${res.status}` };
  } catch (e) {
    if (e && typeof e === "object" && "name" in e && e.name === "AbortError") return { ok: false, error: "timeout" };
    return { ok: false, error: "network" };
  } finally {
    clearTimeout(timer);
  }
}

const MAX_CONTENT = 3500;
export function formatContactMessage(m: { name: string; email: string; content: string; createdAt: Date }): string {
  const kst = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "short" }).format(
    m.createdAt,
  );
  const body = m.content.length > MAX_CONTENT ? `${m.content.slice(0, MAX_CONTENT)}…` : m.content;
  return `📨 새 연락 메시지\n\n이름: ${m.name}\n이메일: ${m.email}\n시간: ${kst}\n\n${body}`;
}
