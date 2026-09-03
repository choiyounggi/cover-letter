import { describe, it, expect, beforeAll, beforeEach } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("profile/links/skills data (DB)", () => {
  let prisma: typeof import("@/lib/db/prisma").prisma;
  let profileMod: typeof import("../profile");
  let linksMod: typeof import("../links");
  let skillsMod: typeof import("../skills");

  beforeAll(async () => {
    ({ prisma } = await import("@/lib/db/prisma"));
    profileMod = await import("../profile");
    linksMod = await import("../links");
    skillsMod = await import("../skills");
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "Profile","Link","Skill","Company","Experience","Project","TimelineEvent","Message","Setting" CASCADE'
    );
  });

  it("upsertProfile creates then updates the singleton", async () => {
    const created = await profileMod.upsertProfile({ name: "A", title: "T" });
    expect(created.id).toBe("main");

    const updated = await profileMod.upsertProfile({ name: "B", title: "T" });
    expect(updated.name).toBe("B");

    const count = await prisma.profile.count();
    expect(count).toBe(1);
  });

  it("createLink with invalid url throws ZodError", async () => {
    await expect(linksMod.createLink({ label: "x", url: "not-a-url" })).rejects.toThrow();
  });

  it("reorderLinks([c,a,b]) -> getLinks order c,a,b", async () => {
    const a = await linksMod.createLink({ label: "a", url: "https://a.example.com" });
    const b = await linksMod.createLink({ label: "b", url: "https://b.example.com" });
    const c = await linksMod.createLink({ label: "c", url: "https://c.example.com" });

    await linksMod.reorderLinks([c.id, a.id, b.id]);
    const ordered = await linksMod.getLinks();
    expect(ordered.map((l) => l.id)).toEqual([c.id, a.id, b.id]);
  });

  it("getSkillsByCategory on empty DB returns all 5 category keys empty", async () => {
    const grouped = await skillsMod.getSkillsByCategory();
    expect(grouped).toEqual({ BACKEND: [], FRONTEND: [], DEVOPS: [], TOOLS: [], OTHER: [] });
  });

  it("duplicate skill name+category throws", async () => {
    await skillsMod.createSkill({ name: "Java", category: "BACKEND" });
    await expect(skillsMod.createSkill({ name: "Java", category: "BACKEND" })).rejects.toThrow();
  });
});
