"use server";
import { projectInputSchema, reorderSchema, type ProjectInput } from "@/lib/schemas/content";
import { createProject, updateProject, deleteProject, reorderProjects } from "@/lib/data";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

function toProjectInput(fd: FormData): ProjectInput {
  const raw = formToObject(fd, { arrays: ["techStack"], booleans: ["featured"] });
  if (raw.startDate === "") raw.startDate = null;
  if (raw.endDate === "") raw.endDate = null;
  return raw as unknown as ProjectInput;
}

export const createProjectAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const input = toProjectInput(fd);
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) return toActionError(parsed.error);
  await createProject(input);
  revalidateAdmin("/admin/projects");
  return { status: "ok", message: "추가했어요" };
});

export const updateProjectAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const input = toProjectInput(fd);
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) return toActionError(parsed.error);
  await updateProject(id, input);
  revalidateAdmin("/admin/projects");
  return { status: "ok", message: "저장했어요" };
});

export const deleteProjectAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await deleteProject(id);
  revalidateAdmin("/admin/projects");
  return { status: "ok", message: "삭제했어요" };
});

export const reorderProjectsAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const raw = String(fd.get("ids") ?? "[]");
  const parsed = reorderSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return toActionError(parsed.error);
  await reorderProjects(parsed.data);
  revalidateAdmin("/admin/projects");
  return { status: "ok", message: "순서를 저장했어요" };
});
