import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  markMessageRead: vi.fn(),
  deleteMessage: vi.fn(),
  getSettings: vi.fn(),
  setSetting: vi.fn(),
  sendTelegramMessage: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/data", () => ({
  markMessageRead: mocks.markMessageRead,
  deleteMessage: mocks.deleteMessage,
  getSettings: mocks.getSettings,
  setSetting: mocks.setSetting,
}));
vi.mock("@/lib/telegram", () => ({ sendTelegramMessage: mocks.sendTelegramMessage }));

import { markMessageReadAction, deleteMessageAction } from "../../messages";
import { saveSettingsAction, sendTestTelegramAction } from "../../settings";
import { maskSecret } from "@/lib/mask";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { login: "choiyounggi" } });
  mocks.getSettings.mockResolvedValue({
    "telegram.botToken": "123456:ABCDEF",
    "telegram.chatId": "999",
    "site.ogImageUrl": "",
  });
});

describe("markMessageReadAction", () => {
  it("marks read and revalidates the messages page (normal)", async () => {
    mocks.markMessageRead.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await markMessageReadAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.markMessageRead).toHaveBeenCalledWith("1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/messages");
  });
});

describe("deleteMessageAction", () => {
  it("deletes the message (normal)", async () => {
    mocks.deleteMessage.mockResolvedValue({ id: "1" });
    const fd = new FormData();
    fd.set("id", "1");
    const result = await deleteMessageAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.deleteMessage).toHaveBeenCalledWith("1");
  });
});

describe("saveSettingsAction", () => {
  it("keeps the stored token when botToken is empty, but still saves chatId (boundary)", async () => {
    const fd = new FormData();
    fd.set("botToken", "");
    fd.set("chatId", "999");
    fd.set("ogImageUrl", "");
    const result = await saveSettingsAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.setSetting).not.toHaveBeenCalledWith("telegram.botToken", expect.anything());
    expect(mocks.setSetting).toHaveBeenCalledWith("telegram.chatId", "999");
  });

  it("saves a new token when provided (normal)", async () => {
    const fd = new FormData();
    fd.set("botToken", "654321:ZZZZZZ");
    fd.set("chatId", "999");
    fd.set("ogImageUrl", "");
    const result = await saveSettingsAction({ status: "idle" }, fd);
    expect(result.status).toBe("ok");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(mocks.setSetting).toHaveBeenCalledWith("telegram.botToken", "654321:ZZZZZZ");
  });

  it("returns fieldErrors keyed by the actual form field (chatId), not the schema's internal 'value' key, and saves nothing (error)", async () => {
    const fd = new FormData();
    fd.set("botToken", "");
    fd.set("chatId", "x".repeat(2001));
    fd.set("ogImageUrl", "");
    const result = await saveSettingsAction({ status: "idle" }, fd);
    if (result.status !== "error") throw new Error("expected error status");
    expect(result.fieldErrors?.chatId?.length).toBeGreaterThan(0);
    expect(result.fieldErrors?.value).toBeUndefined();
    expect(mocks.setSetting).not.toHaveBeenCalled();
  });
});

describe("sendTestTelegramAction", () => {
  it("returns an error message with the reason but never the token (error)", async () => {
    mocks.sendTelegramMessage.mockResolvedValue({ ok: false, error: "telegram:Unauthorized" });
    const result = await sendTestTelegramAction({ status: "idle" }, new FormData());
    if (result.status !== "error") throw new Error("expected error status");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(result.message).toContain("Unauthorized");
    expect(result.message).not.toContain("123456:ABCDEF");
  });

  it("returns an ok message when the sender succeeds (normal)", async () => {
    mocks.sendTelegramMessage.mockResolvedValue({ ok: true });
    const result = await sendTestTelegramAction({ status: "idle" }, new FormData());
    if (result.status !== "ok") throw new Error("expected ok status");
    expect(mocks.requireAdmin).toHaveBeenCalled();
    expect(result.message).toBe("테스트 메시지를 보냈어요");
  });
});

describe("maskSecret", () => {
  it("masks all but the last 4 characters (normal)", () => {
    expect(maskSecret("123456:ABCDEF")).toBe("••••CDEF");
  });

  it("returns an empty string for an empty secret (boundary)", () => {
    expect(maskSecret("")).toBe("");
  });

  it("prefixes the mask even when the secret is 4 characters or shorter (boundary)", () => {
    expect(maskSecret("ab")).toBe("••••ab");
  });
});
