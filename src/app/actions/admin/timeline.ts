"use server";
import { timelineEventInputSchema, type TimelineEventInput } from "@/lib/schemas/content";
import { createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/lib/data";
import { adminAction, formToObject, toActionError, revalidateAdmin, type ActionState } from "./_helpers";

function toTimelineEventInput(fd: FormData): TimelineEventInput {
  const raw = formToObject(fd, { numbers: ["sortOrder"] });
  if (raw.companyId === "") raw.companyId = null;
  if (raw.endDate === "") raw.endDate = null;
  return raw as unknown as TimelineEventInput;
}

export const createTimelineEventAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const input = toTimelineEventInput(fd);
  const parsed = timelineEventInputSchema.safeParse(input);
  if (!parsed.success) return toActionError(parsed.error);
  await createTimelineEvent(input);
  revalidateAdmin("/admin/timeline");
  return { status: "ok", message: "추가했어요" };
});

export const updateTimelineEventAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  const input = toTimelineEventInput(fd);
  const parsed = timelineEventInputSchema.safeParse(input);
  if (!parsed.success) return toActionError(parsed.error);
  await updateTimelineEvent(id, input);
  revalidateAdmin("/admin/timeline");
  return { status: "ok", message: "저장했어요" };
});

export const deleteTimelineEventAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const id = String(fd.get("id") ?? "");
  await deleteTimelineEvent(id);
  revalidateAdmin("/admin/timeline");
  return { status: "ok", message: "삭제했어요" };
});
