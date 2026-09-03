"use server";
import { markMessageRead, deleteMessage } from "@/lib/data";
import { adminAction, revalidateAdmin, type ActionState } from "./_helpers";

export const markMessageReadAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await markMessageRead(id);
  revalidateAdmin("/admin/messages");
  return { status: "ok" };
});

export const deleteMessageAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await deleteMessage(id);
  revalidateAdmin("/admin/messages");
  return { status: "ok", message: "삭제했어요" };
});
