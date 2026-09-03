"use client";
import { useActionState } from "react";
import type { Skill } from "@/generated/prisma/client";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { Field, TextInput, Select, SubmitButton, FormMessage } from "@/components/admin";

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  BACKEND: "백엔드",
  FRONTEND: "프론트엔드",
  DEVOPS: "DevOps",
  TOOLS: "도구",
  OTHER: "기타",
};

export function SkillForm({
  skill,
  action,
  defaultCategory,
}: {
  skill?: Skill;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  defaultCategory?: string;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {skill ? <input type="hidden" name="id" value={skill.id} /> : null}
      {skill ? <input type="hidden" name="sortOrder" value={String(skill.sortOrder)} /> : null}
      <Field label="이름" name="name" error={err("name")}>
        {(props) => <TextInput {...props} defaultValue={skill?.name ?? ""} required />}
      </Field>
      <Field label="카테고리" name="category" error={err("category")}>
        {(props) => (
          <Select {...props} defaultValue={skill?.category ?? defaultCategory ?? "BACKEND"}>
            {Object.entries(SKILL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="숙련도" name="level" error={err("level")}>
        {(props) => (
          <Select {...props} defaultValue={String(skill?.level ?? 3)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="아이콘" name="icon" hint="선택 사항" error={err("icon")}>
        {(props) => <TextInput {...props} defaultValue={skill?.icon ?? ""} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">{skill ? "저장" : "추가"}</SubmitButton>
    </form>
  );
}
