"use server";
import { linkInputSchema, reorderSchema } from "@/lib/schemas/content";
import { createLink, updateLink, deleteLink, reorderLinks } from "@/lib/data";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

export const createLinkAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const parsed = linkInputSchema.safeParse(formToObject(fd, { numbers: ["sortOrder"] }));
  if (!parsed.success) return toActionError(parsed.error);
  await createLink(parsed.data);
  revalidateAdmin("/admin/links");
  return { status: "ok", message: "추가했어요" };
});

export const updateLinkAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const parsed = linkInputSchema.safeParse(formToObject(fd, { numbers: ["sortOrder"] }));
  if (!parsed.success) return toActionError(parsed.error);
  await updateLink(id, parsed.data);
  revalidateAdmin("/admin/links");
  return { status: "ok", message: "저장했어요" };
});

export const deleteLinkAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await deleteLink(id);
  revalidateAdmin("/admin/links");
  return { status: "ok", message: "삭제했어요" };
});

export const reorderLinksAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const raw = String(fd.get("ids") ?? "[]");
  const parsed = reorderSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return toActionError(parsed.error);
  await reorderLinks(parsed.data);
  revalidateAdmin("/admin/links");
  return { status: "ok", message: "순서를 저장했어요" };
});
