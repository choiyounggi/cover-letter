import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data", () => ({
  createMessage: vi.fn(),
  markTelegramSent: vi.fn(),
  getSettings: vi.fn(),
}));

vi.mock("@/lib/telegram", () => ({
  sendTelegramMessage: vi.fn(),
  formatContactMessage: vi.fn(() => "msg"),
}));

import { createMessage, getSettings, markTelegramSent } from "@/lib/data";
import { formatContactMessage, sendTelegramMessage } from "@/lib/telegram";
import { submitContact, type ContactState } from "@/app/actions/contact";

const createMessageMock = vi.mocked(createMessage);
const getSettingsMock = vi.mocked(getSettings);
const markTelegramSentMock = vi.mocked(markTelegramSent);
const sendTelegramMessageMock = vi.mocked(sendTelegramMessage);
const formatContactMessageMock = vi.mocked(formatContactMessage);

function fd(obj: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) formData.set(key, value);
  return formData;
}

const idle: ContactState = { status: "idle" };
const message = {
  id: "msg-1",
  name: "최영기",
  email: "test@example.com",
  content: "안녕하세요",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  readAt: null,
  telegramSentAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitContact", () => {
  it("persists, notifies telegram, and marks it sent on the happy path (normal)", async () => {
    createMessageMock.mockResolvedValue(message);
    getSettingsMock.mockResolvedValue({ "telegram.botToken": "tok", "telegram.chatId": "chat", "site.ogImageUrl": "" });
    sendTelegramMessageMock.mockResolvedValue({ ok: true });
    markTelegramSentMock.mockResolvedValue(message);

    const result = await submitContact(idle, fd({ name: "최영기", email: "test@example.com", content: "안녕하세요" }));

    expect(result).toEqual({ status: "ok" });
    const createOrder = createMessageMock.mock.invocationCallOrder[0];
    const settingsOrder = getSettingsMock.mock.invocationCallOrder[0];
    const sendOrder = sendTelegramMessageMock.mock.invocationCallOrder[0];
    const markOrder = markTelegramSentMock.mock.invocationCallOrder[0];
    expect(createOrder).toBeLessThan(settingsOrder);
    expect(settingsOrder).toBeLessThan(sendOrder);
    expect(sendOrder).toBeLessThan(markOrder);
    expect(markTelegramSentMock).toHaveBeenCalledWith(message.id);
    expect(formatContactMessageMock).toHaveBeenCalled();
  });

  it("returns field errors and never touches the DB when content is empty (error)", async () => {
    const result = await submitContact(idle, fd({ name: "최영기", email: "test@example.com", content: "" }));

    expect(result.status).toBe("error");
    expect(result.status === "error" && result.fieldErrors?.content).toBeTruthy();
    expect(createMessageMock).not.toHaveBeenCalled();
  });

  it("returns ok silently without persisting or sending when the honeypot is filled (boundary/bot)", async () => {
    const result = await submitContact(
      idle,
      fd({ name: "최영기", email: "test@example.com", content: "안녕하세요", website: "x" }),
    );

    expect(result).toEqual({ status: "ok" });
    expect(createMessageMock).not.toHaveBeenCalled();
    expect(sendTelegramMessageMock).not.toHaveBeenCalled();
  });

  it("still returns ok when telegram delivery fails, without marking it sent (async failure)", async () => {
    createMessageMock.mockResolvedValue(message);
    getSettingsMock.mockResolvedValue({ "telegram.botToken": "", "telegram.chatId": "", "site.ogImageUrl": "" });
    sendTelegramMessageMock.mockResolvedValue({ ok: false, error: "missing-config" });

    const result = await submitContact(idle, fd({ name: "최영기", email: "test@example.com", content: "안녕하세요" }));

    expect(result).toEqual({ status: "ok" });
    expect(markTelegramSentMock).not.toHaveBeenCalled();
  });

  it("still returns ok when getSettings rejects after the message is already stored (async failure)", async () => {
    createMessageMock.mockResolvedValue(message);
    getSettingsMock.mockRejectedValue(new Error("db down"));

    const result = await submitContact(idle, fd({ name: "최영기", email: "test@example.com", content: "안녕하세요" }));

    expect(result).toEqual({ status: "ok" });
    expect(createMessageMock).toHaveBeenCalledTimes(1);
    expect(sendTelegramMessageMock).not.toHaveBeenCalled();
    expect(markTelegramSentMock).not.toHaveBeenCalled();
  });

  it("returns a generic message with no internals when the DB write throws (error)", async () => {
    createMessageMock.mockRejectedValue(new Error("connection refused at 10.0.0.5"));

    const result = await submitContact(idle, fd({ name: "최영기", email: "test@example.com", content: "안녕하세요" }));

    expect(result).toEqual({ status: "error", message: "잠시 후 다시 시도해 주세요." });
  });
});
