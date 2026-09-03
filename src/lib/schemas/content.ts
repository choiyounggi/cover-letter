import { z } from "zod";

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
  .transform((s) => new Date(`${s}T00:00:00.000Z`));
export const optionalDate = dateString
  .nullable()
  .optional()
  .transform((d) => d ?? null);
export const urlOrEmpty = z
  .union([z.url(), z.literal("")])
  .transform((v) => (v === "" ? null : v));
export const urlOrEmptyOrPath = z
  .union([z.url(), z.string().regex(/^\/[^\s]*$/), z.literal("")])
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();
export const skillCategoryEnum = z.enum(["BACKEND", "FRONTEND", "DEVOPS", "TOOLS", "OTHER"]);
export const timelineCategoryEnum = z.enum(["LIFE", "EDUCATION", "CAREER", "PROJECT", "MILESTONE"]);

export const profileInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  nameEn: z.string().max(100).nullable().optional(),
  title: z.string().trim().min(1).max(120),
  tagline: z.string().max(200).nullable().optional(),
  bio: z.string().max(10000).default(""),
  avatarUrl: urlOrEmptyOrPath,
  email: z
    .union([z.email(), z.literal("")])
    .transform((v) => v || null)
    .nullable()
    .optional(),
  location: z.string().max(100).nullable().optional(),
  resumeUrl: urlOrEmpty.nullable().optional(),
});
export type ProfileInput = z.input<typeof profileInputSchema>;
export type ProfileData = z.output<typeof profileInputSchema>;

export const linkInputSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: z.url(),
  icon: z.string().max(40).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export type LinkInput = z.input<typeof linkInputSchema>;
export type LinkData = z.output<typeof linkInputSchema>;

export const skillInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: skillCategoryEnum,
  level: z.number().int().min(1).max(5).default(3),
  icon: z.string().max(40).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export type SkillInput = z.input<typeof skillInputSchema>;
export type SkillData = z.output<typeof skillInputSchema>;

export const companyInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  logoUrl: urlOrEmptyOrPath,
  url: urlOrEmpty.nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export type CompanyInput = z.input<typeof companyInputSchema>;
export type CompanyData = z.output<typeof companyInputSchema>;

export const experienceInputSchema = z.object({
  companyId: z.string().min(1),
  role: z.string().trim().min(1).max(100),
  startDate: dateString,
  endDate: optionalDate,
  summary: z.string().max(5000).default(""),
  achievements: z.array(z.string().max(500)).max(50).default([]),
  techStack: z.array(z.string().max(40)).max(50).default([]),
  sortOrder: z.number().int().min(0).default(0),
});
export type ExperienceInput = z.input<typeof experienceInputSchema>;
export type ExperienceData = z.output<typeof experienceInputSchema>;

export const projectInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(300),
  description: z.string().max(10000).default(""),
  techStack: z.array(z.string().max(40)).max(50).default([]),
  repoUrl: urlOrEmpty.nullable().optional(),
  liveUrl: urlOrEmpty.nullable().optional(),
  imageUrl: urlOrEmptyOrPath,
  startDate: optionalDate,
  endDate: optionalDate,
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});
export type ProjectInput = z.input<typeof projectInputSchema>;
export type ProjectData = z.output<typeof projectInputSchema>;

export const timelineEventInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(5000).default(""),
  date: dateString,
  endDate: optionalDate,
  category: timelineCategoryEnum,
  icon: z.string().max(40).nullable().optional(),
  imageUrl: urlOrEmptyOrPath,
  companyId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});
export type TimelineEventInput = z.input<typeof timelineEventInputSchema>;
export type TimelineEventData = z.output<typeof timelineEventInputSchema>;

export const reorderSchema = z.array(z.string().min(1)).min(1).max(500);
