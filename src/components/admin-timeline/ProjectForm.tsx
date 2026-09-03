"use client";
import { useActionState } from "react";
import type { Project } from "@/generated/prisma/client";
import type { ActionState } from "@/app/actions/admin/_helpers";
import { Field, TextInput, TextArea, Checkbox, SubmitButton, FormMessage, TagsInput } from "@/components/admin";
import { toDateInput } from "./date-input";

export function ProjectForm({
  project,
  action,
}: {
  project?: Project;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <Field label="제목" name="title" error={err("title")}>
        {(props) => <TextInput {...props} defaultValue={project?.title ?? ""} required />}
      </Field>
      <Field label="요약" name="summary" error={err("summary")}>
        {(props) => <TextInput {...props} defaultValue={project?.summary ?? ""} required />}
      </Field>
      <Field label="설명" name="description" hint="선택 사항" error={err("description")}>
        {(props) => <TextArea {...props} defaultValue={project?.description ?? ""} />}
      </Field>
      <Field label="기술 스택" name="techStack" hint="쉼표로 구분해요" error={err("techStack")}>
        {(props) => <TagsInput {...props} defaultValue={(project?.techStack ?? []).join(", ")} />}
      </Field>
      <Field label="저장소 URL" name="repoUrl" hint="선택 사항" error={err("repoUrl")}>
        {(props) => <TextInput {...props} defaultValue={project?.repoUrl ?? ""} />}
      </Field>
      <Field label="배포 URL" name="liveUrl" hint="선택 사항" error={err("liveUrl")}>
        {(props) => <TextInput {...props} defaultValue={project?.liveUrl ?? ""} />}
      </Field>
      <Field label="이미지 URL" name="imageUrl" hint="선택 사항" error={err("imageUrl")}>
        {(props) => <TextInput {...props} defaultValue={project?.imageUrl ?? ""} />}
      </Field>
      <Field label="시작일" name="startDate" hint="선택 사항" error={err("startDate")}>
        {(props) => <TextInput {...props} type="date" defaultValue={toDateInput(project?.startDate ?? null)} />}
      </Field>
      <Field label="종료일" name="endDate" hint="선택 사항" error={err("endDate")}>
        {(props) => <TextInput {...props} type="date" defaultValue={toDateInput(project?.endDate ?? null)} />}
      </Field>
      <label className="flex items-center gap-2 text-sm text-fg">
        <Checkbox name="featured" defaultChecked={project?.featured ?? false} />
        추천 프로젝트
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">{project ? "저장" : "추가"}</SubmitButton>
    </form>
  );
}
