import { describe, it, expect, beforeAll, beforeEach } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("companies/projects data (DB)", () => {
  let prisma: typeof import("@/lib/db/prisma").prisma;
  let companiesMod: typeof import("../companies");
  let projectsMod: typeof import("../projects");

  beforeAll(async () => {
    ({ prisma } = await import("@/lib/db/prisma"));
    companiesMod = await import("../companies");
    projectsMod = await import("../projects");
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "Profile","Link","Skill","Company","Experience","Project","TimelineEvent","Message","Setting" CASCADE'
    );
  });

  it("getCompaniesWithExperiences orders companies by sortOrder, experiences by startDate desc", async () => {
    const second = await companiesMod.createCompany({ name: "Second", sortOrder: 1 });
    const first = await companiesMod.createCompany({ name: "First", sortOrder: 0 });
    await companiesMod.createExperience({ companyId: first.id, role: "Junior", startDate: "2020-01-01" });
    await companiesMod.createExperience({ companyId: first.id, role: "Senior", startDate: "2022-01-01" });

    const results = await companiesMod.getCompaniesWithExperiences();
    expect(results.map((c) => c.id)).toEqual([first.id, second.id]);
    expect(results[0].experiences.map((e) => e.role)).toEqual(["Senior", "Junior"]);
  });

  it("createExperience with a companyId that does not exist throws", async () => {
    await expect(
      companiesMod.createExperience({ companyId: "does-not-exist", role: "x", startDate: "2020-01-01" })
    ).rejects.toThrow();
  });

  it("deleteCompany cascades its experiences", async () => {
    const company = await companiesMod.createCompany({ name: "ACME" });
    await companiesMod.createExperience({ companyId: company.id, role: "Eng", startDate: "2020-01-01" });

    await companiesMod.deleteCompany(company.id);
    const count = await prisma.experience.count();
    expect(count).toBe(0);
  });

  it("createProject with empty summary throws", async () => {
    await expect(projectsMod.createProject({ title: "x", summary: "" })).rejects.toThrow();
  });

  it("getFeaturedProjects returns only featured=true", async () => {
    await projectsMod.createProject({ title: "A", summary: "s", featured: true });
    await projectsMod.createProject({ title: "B", summary: "s", featured: false });

    const featured = await projectsMod.getFeaturedProjects();
    expect(featured.map((p) => p.title)).toEqual(["A"]);
  });

  it("reorderProjects reorders", async () => {
    const a = await projectsMod.createProject({ title: "A", summary: "s" });
    const b = await projectsMod.createProject({ title: "B", summary: "s" });

    await projectsMod.reorderProjects([b.id, a.id]);
    const ordered = await projectsMod.getProjects();
    expect(ordered.map((p) => p.id)).toEqual([b.id, a.id]);
  });
});
