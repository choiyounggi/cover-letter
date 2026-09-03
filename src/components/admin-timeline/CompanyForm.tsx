"use client";
import { useActionState } from "react";
import type { Company } from "@/generated/prisma/client";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { Field, TextInput, TextArea, SubmitButton, FormMessage } from "@/components/admin";

export function CompanyForm({
  company,
  action,
}: {
  company?: Company;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {company ? <input type="hidden" name="id" value={company.id} /> : null}
      {company ? <input type="hidden" name="sortOrder" value={String(company.sortOrder)} /> : null}
      <Field label="회사명" name="name" error={err("name")}>
        {(props) => <TextInput {...props} defaultValue={company?.name ?? ""} required />}
      </Field>
      <Field label="로고 URL" name="logoUrl" hint="선택 사항" error={err("logoUrl")}>
        {(props) => <TextInput {...props} defaultValue={company?.logoUrl ?? ""} />}
      </Field>
      <Field label="웹사이트" name="url" hint="선택 사항" error={err("url")}>
        {(props) => <TextInput {...props} type="url" defaultValue={company?.url ?? ""} />}
      </Field>
      <Field label="설명" name="description" hint="선택 사항" error={err("description")}>
        {(props) => <TextArea {...props} defaultValue={company?.description ?? ""} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">{company ? "저장" : "추가"}</SubmitButton>
    </form>
  );
}
