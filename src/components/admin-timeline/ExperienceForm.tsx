"use client";
import { useActionState } from "react";
import type { Company, Experience } from "@/generated/prisma/client";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { Field, TextInput, TextArea, Select, SubmitButton, FormMessage, TagsInput } from "@/components/admin";
import { toDateInput } from "./date-input";

export function ExperienceForm({
  experience,
  companies,
  fixedCompanyId,
  action,
}: {
  experience?: Experience;
  companies?: Pick<Company, "id" | "name">[];
  fixedCompanyId?: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  const companyId = fixedCompanyId ?? experience?.companyId;
  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {experience ? <input type="hidden" name="id" value={experience.id} /> : null}
      {fixedCompanyId ? (
        <input type="hidden" name="companyId" value={fixedCompanyId} />
      ) : (
        <Field label="회사" name="companyId" error={err("companyId")}>
          {(props) => (
            <Select {...props} defaultValue={companyId ?? ""} required>
              <option value="" disabled>
                회사 선택
              </option>
              {(companies ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}
      <Field label="직무" name="role" error={err("role")}>
        {(props) => <TextInput {...props} defaultValue={experience?.role ?? ""} required />}
      </Field>
      <Field label="시작일" name="startDate" error={err("startDate")}>
        {(props) => (
          <TextInput {...props} type="date" defaultValue={toDateInput(experience?.startDate ?? null)} required />
        )}
      </Field>
      <Field label="종료일" name="endDate" hint="비워두면 현재 재직 중으로 표시돼요" error={err("endDate")}>
        {(props) => <TextInput {...props} type="date" defaultValue={toDateInput(experience?.endDate ?? null)} />}
      </Field>
      <Field label="요약" name="summary" hint="선택 사항" error={err("summary")}>
        {(props) => <TextArea {...props} defaultValue={experience?.summary ?? ""} />}
      </Field>
      <Field label="성과" name="achievements" hint="한 줄에 하나씩 입력해요" error={err("achievements")}>
        {(props) => <TextArea {...props} defaultValue={(experience?.achievements ?? []).join("\n")} />}
      </Field>
      <Field label="기술 스택" name="techStack" hint="쉼표로 구분해요" error={err("techStack")}>
        {(props) => <TagsInput {...props} defaultValue={(experience?.techStack ?? []).join(", ")} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">{experience ? "저장" : "경력 추가"}</SubmitButton>
    </form>
  );
}
