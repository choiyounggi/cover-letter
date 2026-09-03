"use client";
import { useActionState } from "react";
import { saveSettingsAction, sendTestTelegramAction } from "@/app/actions/admin/settings";
import { Field, TextInput, SubmitButton, FormMessage } from "@/components/admin";
import { maskSecret } from "@/lib/mask";
import type { SettingKey } from "@/lib/schemas/settings";

export function SettingsForm({ settings }: { settings: Record<SettingKey, string> }) {
  const [state, formAction] = useActionState(saveSettingsAction, { status: "idle" });
  const [testState, testAction] = useActionState(sendTestTelegramAction, { status: "idle" });
  const err = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);
  const maskedToken = maskSecret(settings["telegram.botToken"]);

  return (
    <div className="flex max-w-md flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-4">
        <Field
          label="텔레그램 봇 토큰"
          name="botToken"
          hint={maskedToken ? `현재 값: ${maskedToken} (비워두면 유지)` : "설정되지 않음"}
          error={err("botToken")}
        >
          {(props) => <TextInput {...props} type="password" placeholder={maskedToken || "새 토큰 입력"} defaultValue="" />}
        </Field>
        <Field label="텔레그램 채팅 ID" name="chatId" error={err("chatId")}>
          {(props) => <TextInput {...props} defaultValue={settings["telegram.chatId"]} />}
        </Field>
        <Field label="OG 이미지 URL" name="ogImageUrl" error={err("ogImageUrl")}>
          {(props) => <TextInput {...props} defaultValue={settings["site.ogImageUrl"]} />}
        </Field>
        <FormMessage state={state} />
        <SubmitButton pendingText="저장 중...">저장</SubmitButton>
      </form>
      <form action={testAction} className="flex flex-col gap-2 border-t border-border pt-6">
        <p className="text-sm text-fg-muted">저장된 텔레그램 설정으로 테스트 메시지를 보냅니다.</p>
        <FormMessage state={testState} />
        <SubmitButton pendingText="전송 중...">테스트 전송</SubmitButton>
      </form>
    </div>
  );
}
