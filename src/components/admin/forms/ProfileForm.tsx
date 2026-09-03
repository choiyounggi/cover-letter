"use client";
import { useActionState } from "react";
import type { Profile } from "@/generated/prisma/client";
import { saveProfile } from "@/app/actions/admin/profile";
import { Field, TextInput, TextArea, SubmitButton, FormMessage } from "@/components/admin";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useActionState(saveProfile, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <Field label="이름" name="name" error={err("name")}>
        {(props) => <TextInput {...props} defaultValue={profile?.name ?? ""} required />}
      </Field>
      <Field label="영문 이름" name="nameEn" error={err("nameEn")}>
        {(props) => <TextInput {...props} defaultValue={profile?.nameEn ?? ""} />}
      </Field>
      <Field label="직함" name="title" error={err("title")}>
        {(props) => <TextInput {...props} defaultValue={profile?.title ?? ""} required />}
      </Field>
      <Field label="태그라인" name="tagline" error={err("tagline")}>
        {(props) => <TextInput {...props} defaultValue={profile?.tagline ?? ""} />}
      </Field>
      <Field label="소개" name="bio" error={err("bio")}>
        {(props) => <TextArea {...props} defaultValue={profile?.bio ?? ""} />}
      </Field>
      <Field label="아바타 URL" name="avatarUrl" error={err("avatarUrl")}>
        {(props) => <TextInput {...props} defaultValue={profile?.avatarUrl ?? ""} />}
      </Field>
      <Field label="이메일" name="email" error={err("email")}>
        {(props) => <TextInput {...props} type="email" defaultValue={profile?.email ?? ""} />}
      </Field>
      <Field label="위치" name="location" error={err("location")}>
        {(props) => <TextInput {...props} defaultValue={profile?.location ?? ""} />}
      </Field>
      <Field label="이력서 URL" name="resumeUrl" error={err("resumeUrl")}>
        {(props) => <TextInput {...props} defaultValue={profile?.resumeUrl ?? ""} />}
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}
