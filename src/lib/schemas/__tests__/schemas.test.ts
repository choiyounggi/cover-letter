import { describe, expect, it } from "vitest";
import {
  dateString,
  profileInputSchema,
  linkInputSchema,
  skillInputSchema,
  experienceInputSchema,
  projectInputSchema,
  timelineEventInputSchema,
} from "../content";
import { messageInputSchema } from "../messages";

describe("dateString", () => {
  it("parses YYYY-MM-DD into a Date that round-trips to the same day", () => {
    const parsed = dateString.parse("2021-07-01");
    expect(parsed.toISOString().slice(0, 10)).toBe("2021-07-01");
  });
});

describe("profileInputSchema", () => {
  it("accepts a valid profile", () => {
    const result = profileInputSchema.parse({ name: "최영기", title: "백엔드 엔지니어" });
    expect(result.name).toBe("최영기");
  });

  it("rejects an empty name", () => {
    expect(() => profileInputSchema.parse({ name: "", title: "t" })).toThrow();
  });

  it("boundary: name of exactly 100 chars passes, 101 fails", () => {
    const ok100 = "a".repeat(100);
    const fail101 = "a".repeat(101);
    expect(profileInputSchema.parse({ name: ok100, title: "t" }).name).toBe(ok100);
    expect(() => profileInputSchema.parse({ name: fail101, title: "t" })).toThrow();
  });
});

describe("linkInputSchema", () => {
  it("accepts a valid link", () => {
    const result = linkInputSchema.parse({ label: "GitHub", url: "https://github.com/x" });
    expect(result.label).toBe("GitHub");
  });

  it("rejects an invalid url", () => {
    expect(() => linkInputSchema.parse({ label: "x", url: "not-a-url" })).toThrow();
  });

  it("boundary: label of exactly 60 chars passes, 61 fails", () => {
    const ok60 = "a".repeat(60);
    const fail61 = "a".repeat(61);
    expect(linkInputSchema.parse({ label: ok60, url: "https://x.com" }).label).toBe(ok60);
    expect(() => linkInputSchema.parse({ label: fail61, url: "https://x.com" })).toThrow();
  });
});

describe("skillInputSchema", () => {
  it("accepts a valid skill", () => {
    const result = skillInputSchema.parse({ name: "Java", category: "BACKEND", level: 4 });
    expect(result.level).toBe(4);
  });

  it("rejects level out of range", () => {
    expect(() => skillInputSchema.parse({ name: "Java", category: "BACKEND", level: 6 })).toThrow();
  });

  it("boundary: level 1 and 5 pass, 0 fails", () => {
    expect(skillInputSchema.parse({ name: "a", category: "BACKEND", level: 1 }).level).toBe(1);
    expect(skillInputSchema.parse({ name: "a", category: "BACKEND", level: 5 }).level).toBe(5);
    expect(() => skillInputSchema.parse({ name: "a", category: "BACKEND", level: 0 })).toThrow();
  });
});

describe("experienceInputSchema", () => {
  const base = { companyId: "c1", role: "Engineer", startDate: "2021-07-01" };

  it("accepts a valid experience", () => {
    const result = experienceInputSchema.parse(base);
    expect(result.role).toBe("Engineer");
  });

  it("rejects an empty role", () => {
    expect(() => experienceInputSchema.parse({ ...base, role: "" })).toThrow();
  });

  it("boundary: omitted endDate becomes null", () => {
    const result = experienceInputSchema.parse(base);
    expect(result.endDate).toBeNull();
  });
});

describe("projectInputSchema", () => {
  const base = { title: "iTalk", summary: "채팅 상담 솔루션" };

  it("accepts a valid project", () => {
    const result = projectInputSchema.parse(base);
    expect(result.title).toBe("iTalk");
  });

  it("rejects an empty summary", () => {
    expect(() => projectInputSchema.parse({ ...base, summary: "" })).toThrow();
  });

  it("boundary: summary of exactly 300 chars passes, 301 fails", () => {
    const ok300 = "a".repeat(300);
    const fail301 = "a".repeat(301);
    expect(projectInputSchema.parse({ title: "x", summary: ok300 }).summary).toBe(ok300);
    expect(() => projectInputSchema.parse({ title: "x", summary: fail301 })).toThrow();
  });
});

describe("timelineEventInputSchema", () => {
  const base = { title: "커리어 시작", date: "2021-07-01", category: "CAREER" as const };

  it("accepts a valid timeline event", () => {
    const result = timelineEventInputSchema.parse(base);
    expect(result.category).toBe("CAREER");
  });

  it("rejects an invalid category", () => {
    expect(() => timelineEventInputSchema.parse({ ...base, category: "NOPE" })).toThrow();
  });

  it("boundary: omitted endDate becomes null", () => {
    const result = timelineEventInputSchema.parse(base);
    expect(result.endDate).toBeNull();
  });
});

describe("messageInputSchema", () => {
  const base = { name: "Jane", email: "jane@example.com", content: "hi" };

  it("accepts a valid message", () => {
    const result = messageInputSchema.parse(base);
    expect(result.content).toBe("hi");
  });

  it("rejects an invalid email", () => {
    expect(() => messageInputSchema.parse({ ...base, email: "x" })).toThrow();
  });

  it("boundary: content of exactly 5000 chars passes, honeypot fails when filled", () => {
    const ok5000 = "a".repeat(5000);
    expect(messageInputSchema.parse({ ...base, content: ok5000 }).content).toBe(ok5000);
    expect(() => messageInputSchema.parse({ ...base, website: "bot-filled" })).toThrow();
  });
});
