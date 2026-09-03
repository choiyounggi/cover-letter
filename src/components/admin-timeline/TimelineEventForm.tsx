"use client";
import { useActionState } from "react";
import type { Company, TimelineEvent } from "@/generated/prisma/client";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { Field, TextInput, TextArea, Select, SubmitButton, FormMessage } from "@/components/admin";
import { toDateInput } from "./date-input";
import { TIMELINE_CATEGORY_LABELS } from "./labels";

export function TimelineEventForm({
  event,
  companies,
  action,
}: {
  event?: TimelineEvent;
  companies: Pick<Company, "id" | "name">[];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <Field label="제목" name="title" error={err("title")}>
        {(props) => <TextInput {...props} defaultValue={event?.title ?? ""} required />}
      </Field>
      <Field label="날짜" name="date" error={err("date")}>
        {(props) => <TextInput {...props} type="date" defaultValue={toDateInput(event?.date ?? null)} required />}
      </Field>
      <Field label="종료일" name="endDate" hint="선택 사항" error={err("endDate")}>
        {(props) => <TextInput {...props} type="date" defaultValue={toDateInput(event?.endDate ?? null)} />}
      </Field>
      <Field label="카테고리" name="category" error={err("category")}>
        {(props) => (
          <Select {...props} defaultValue={event?.category ?? "LIFE"}>
            {Object.entries(TIMELINE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="설명" name="description" hint="선택 사항" error={err("description")}>
        {(props) => <TextArea {...props} defaultValue={event?.description ?? ""} />}
      </Field>
      <Field label="아이콘" name="icon" hint="이모지 1개" error={err("icon")}>
        {(props) => <TextInput {...props} defaultValue={event?.icon ?? ""} />}
      </Field>
      <Field label="이미지 URL" name="imageUrl" hint="선택 사항" error={err("imageUrl")}>
        {(props) => <TextInput {...props} defaultValue={event?.imageUrl ?? ""} />}
      </Field>
      <Field label="관련 회사" name="companyId" hint="선택 사항" error={err("companyId")}>
        {(props) => (
          <Select {...props} defaultValue={event?.companyId ?? ""}>
            <option value="">없음</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="정렬 순서" name="sortOrder" hint="같은 날짜일 때의 순서" error={err("sortOrder")}>
        {(props) => <TextInput {...props} type="number" defaultValue={event?.sortOrder ?? 0} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">{event ? "저장" : "추가"}</SubmitButton>
    </form>
  );
}
