"use server";
import { revalidatePath } from "next/cache";
import { experienceInputSchema, type ExperienceInput } from "@/lib/schemas/content";
import { createExperience, updateExperience, deleteExperience } from "@/lib/data";
import { linesToArray } from "@/components/admin-timeline/achievements";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

function toExperienceInput(fd: FormData): ExperienceInput {
  const raw = formToObject(fd, { arrays: ["techStack"], numbers: ["sortOrder"] });
  raw.achievements = linesToArray(String(fd.get("achievements") ?? ""));
  if (raw.endDate === "") raw.endDate = null;
  return raw as unknown as ExperienceInput;
}

export const createExperienceAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const input = toExperienceInput(fd);
  const parsed = experienceInputSchema.safeParse(input);
  if (!parsed.success) return toActionError(parsed.error);
  await createExperience(input);
  revalidateAdmin("/admin/experiences");
  revalidatePath(`/admin/companies/${parsed.data.companyId}`);
  return { status: "ok", message: "추가했어요" };
});

export const updateExperienceAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const input = toExperienceInput(fd);
  const parsed = experienceInputSchema.safeParse(input);
  if (!parsed.success) return toActionError(parsed.error);
  await updateExperience(id, input);
  revalidateAdmin("/admin/experiences");
  revalidatePath(`/admin/companies/${parsed.data.companyId}`);
  return { status: "ok", message: "저장했어요" };
});

export const deleteExperienceAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const deleted = await deleteExperience(id);
  revalidateAdmin("/admin/experiences");
  revalidatePath(`/admin/companies/${deleted.companyId}`);
  return { status: "ok", message: "삭제했어요" };
});
