"use server";
import { skillInputSchema, reorderSchema } from "@/lib/schemas/content";
import { createSkill, updateSkill, deleteSkill, reorderSkills } from "@/lib/data";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

export const createSkillAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const parsed = skillInputSchema.safeParse(formToObject(fd, { numbers: ["level"] }));
  if (!parsed.success) return toActionError(parsed.error);
  await createSkill(parsed.data);
  revalidateAdmin("/admin/skills");
  return { status: "ok", message: "추가했어요" };
});

export const updateSkillAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const parsed = skillInputSchema.safeParse(formToObject(fd, { numbers: ["level"] }));
  if (!parsed.success) return toActionError(parsed.error);
  await updateSkill(id, parsed.data);
  revalidateAdmin("/admin/skills");
  return { status: "ok", message: "저장했어요" };
});

export const deleteSkillAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await deleteSkill(id);
  revalidateAdmin("/admin/skills");
  return { status: "ok", message: "삭제했어요" };
});

export const reorderSkillsAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const raw = String(fd.get("ids") ?? "[]");
  const parsed = reorderSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return toActionError(parsed.error);
  await reorderSkills(parsed.data);
  revalidateAdmin("/admin/skills");
  return { status: "ok", message: "순서를 저장했어요" };
});
