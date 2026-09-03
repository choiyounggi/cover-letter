"use server";
import { profileInputSchema } from "@/lib/schemas/content";
import { upsertProfile } from "@/lib/data";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

export const saveProfile = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const parsed = profileInputSchema.safeParse(formToObject(fd));
  if (!parsed.success) return toActionError(parsed.error);
  await upsertProfile(parsed.data);
  revalidateAdmin("/admin/profile");
  return { status: "ok", message: "저장했어요" };
});
