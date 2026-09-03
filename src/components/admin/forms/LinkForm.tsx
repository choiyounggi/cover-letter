"use client";
import { useActionState } from "react";
import type { Link } from "@/generated/prisma/client";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { Field, TextInput, SubmitButton, FormMessage } from "@/components/admin";

export function LinkForm({
  link,
  action,
}: {
  link?: Link;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {link ? <input type="hidden" name="id" value={link.id} /> : null}
      <Field label="라벨" name="label" error={err("label")}>
        {(props) => <TextInput {...props} defaultValue={link?.label ?? ""} required />}
      </Field>
      <Field label="URL" name="url" error={err("url")}>
        {(props) => <TextInput {...props} type="url" defaultValue={link?.url ?? ""} required />}
      </Field>
      <Field label="아이콘" name="icon" hint="선택 사항" error={err("icon")}>
        {(props) => <TextInput {...props} defaultValue={link?.icon ?? ""} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">{link ? "저장" : "추가"}</SubmitButton>
    </form>
  );
}
