import { describe, it, expect, vi } from "vitest";
import { sendTelegramMessage, formatContactMessage } from "../telegram";

describe("sendTelegramMessage", () => {
  it("sends the message and returns ok:true (normal)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const result = await sendTelegramMessage({ botToken: "123:abc", chatId: "42", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123:abc/sendMessage",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ chat_id: "42", text: "hi", disable_web_page_preview: true }),
      }),
    );
  });

  it("maps a telegram error response without leaking the token (error)", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: false, description: "Unauthorized" }), { status: 401 }));
    const result = await sendTelegramMessage({ botToken: "123:abc", chatId: "42", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: false, error: "telegram:Unauthorized" });
    expect(JSON.stringify(result)).not.toContain("123:abc");
  });

  it("maps an AbortError to a timeout error (error)", async () => {
    const abortError = new DOMException("aborted", "AbortError");
    const fetchImpl = vi.fn().mockRejectedValue(abortError);
    const result = await sendTelegramMessage({ botToken: "123:abc", chatId: "42", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: false, error: "timeout" });
  });

  it("returns missing-config and never calls fetch when botToken is empty (boundary)", async () => {
    const fetchImpl = vi.fn();
    const result = await sendTelegramMessage({ botToken: "", chatId: "42", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: false, error: "missing-config" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns missing-config and never calls fetch when chatId is empty (boundary)", async () => {
    const fetchImpl = vi.fn();
    const result = await sendTelegramMessage({ botToken: "123:abc", chatId: "", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: false, error: "missing-config" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("falls back to http-<status> when the response has no description (error)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("not json", { status: 500 }));
    const result = await sendTelegramMessage({ botToken: "123:abc", chatId: "42", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: false, error: "http-500" });
  });

  it("maps a generic fetch rejection to a network error (error)", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const result = await sendTelegramMessage({ botToken: "123:abc", chatId: "42", text: "hi" }, fetchImpl);
    expect(result).toEqual({ ok: false, error: "network" });
  });
});

describe("formatContactMessage", () => {
  it("contains all four fields (normal)", () => {
    const result = formatContactMessage({
      name: "홍길동",
      email: "hong@example.com",
      content: "안녕하세요",
      createdAt: new Date("2026-09-03T01:02:03Z"),
    });
    expect(result).toContain("홍길동");
    expect(result).toContain("hong@example.com");
    expect(result).toContain("안녕하세요");
    expect(result).toContain("2026-09-03 10:02");
  });

  it("truncates content longer than 3500 chars (boundary)", () => {
    const longContent = "a".repeat(4000);
    const result = formatContactMessage({
      name: "n",
      email: "e",
      content: longContent,
      createdAt: new Date("2026-09-03T01:02:03Z"),
    });
    expect(result.length).toBeLessThan(3800);
    expect(result.endsWith("…")).toBe(true);
  });

  it("does not truncate content at exactly 3500 chars (boundary)", () => {
    const exactContent = "a".repeat(3500);
    const result = formatContactMessage({
      name: "n",
      email: "e",
      content: exactContent,
      createdAt: new Date("2026-09-03T01:02:03Z"),
    });
    expect(result.endsWith("…")).toBe(false);
    expect(result.endsWith(exactContent)).toBe(true);
  });
});
