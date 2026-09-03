import { describe, it, expect, beforeAll, beforeEach } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("timeline/messages/settings data (DB)", () => {
  let prisma: typeof import("@/lib/db/prisma").prisma;
  let companiesMod: typeof import("../companies");
  let timelineMod: typeof import("../timeline");
  let messagesMod: typeof import("../messages");
  let settingsMod: typeof import("../settings");

  beforeAll(async () => {
    ({ prisma } = await import("@/lib/db/prisma"));
    companiesMod = await import("../companies");
    timelineMod = await import("../timeline");
    messagesMod = await import("../messages");
    settingsMod = await import("../settings");
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "Profile","Link","Skill","Company","Experience","Project","TimelineEvent","Message","Setting" CASCADE'
    );
  });

  it("getTimeline merges 1 event + 1 experience", async () => {
    const company = await companiesMod.createCompany({ name: "ACME" });
    await companiesMod.createExperience({ companyId: company.id, role: "Engineer", startDate: "2021-07-01" });
    await timelineMod.createTimelineEvent({ title: "Launch", date: "2020-03-01", category: "MILESTONE" });

    const items = await timelineMod.getTimeline();
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.kind).sort()).toEqual(["event", "experience"]);
  });

  it("createMessage sets telegramSentAt null, then markTelegramSent sets it", async () => {
    const message = await messagesMod.createMessage({ name: "Jane", email: "jane@example.com", content: "hi" });
    expect(message.telegramSentAt).toBeNull();

    const sent = await messagesMod.markTelegramSent(message.id);
    expect(sent.telegramSentAt).not.toBeNull();
  });

  it("createMessage rejects a filled honeypot field", async () => {
    await expect(
      messagesMod.createMessage({ name: "Jane", email: "jane@example.com", content: "hi", website: "bot-filled" })
    ).rejects.toThrow();
    expect(await prisma.message.count()).toBe(0);
  });

  it("setSetting twice keeps one row", async () => {
    await settingsMod.setSetting("telegram.botToken", "a");
    await settingsMod.setSetting("telegram.botToken", "b");

    const count = await prisma.setting.count({ where: { key: "telegram.botToken" } });
    expect(count).toBe(1);
    expect(await settingsMod.getSetting("telegram.botToken")).toBe("b");
  });

  it("setSetting rejects a key outside SETTING_KEYS", async () => {
    // @ts-expect-error deliberately outside the SettingKey union
    await expect(settingsMod.setSetting("not.a.real.key", "x")).rejects.toThrow();
  });

  it("creating a TimelineEvent with a duplicate title+date throws", async () => {
    await timelineMod.createTimelineEvent({ title: "Launch", date: "2020-03-01", category: "MILESTONE" });
    await expect(
      timelineMod.createTimelineEvent({ title: "Launch", date: "2020-03-01", category: "MILESTONE" })
    ).rejects.toThrow();
  });
});
