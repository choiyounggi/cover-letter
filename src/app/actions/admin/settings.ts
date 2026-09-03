"use server";
import { z } from "zod";
import { settingInputSchema, type SettingData } from "@/lib/schemas/settings";
import { getSettings, setSetting } from "@/lib/data";
import { sendTelegramMessage } from "@/lib/telegram";
import { adminAction, revalidateAdmin, type ActionState } from "./_helpers";

// settingInputSchema is keyed { key, value }, so a failed parse always reports
// its error under "value" — remap it to the form's actual field name so
// SettingsForm's per-field error lookup (state.fieldErrors?.[name]) works.
function settingFieldError(fieldName: string, err: z.ZodError<SettingData>): ActionState {
  const { fieldErrors } = z.flattenError(err);
  return { status: "error", fieldErrors: { [fieldName]: fieldErrors.value ?? ["유효하지 않은 값이에요"] } };
}

export const saveSettingsAction = adminAction(async (_prev: ActionState, fd: FormData): Promise<ActionState> => {
  const botToken = String(fd.get("botToken") ?? "");
  const chatId = String(fd.get("chatId") ?? "");
  const ogImageUrl = String(fd.get("ogImageUrl") ?? "");

  if (botToken) {
    const parsed = settingInputSchema.safeParse({ key: "telegram.botToken", value: botToken });
    if (!parsed.success) return settingFieldError("botToken", parsed.error);
    await setSetting("telegram.botToken", botToken);
  }

  const chatIdParsed = settingInputSchema.safeParse({ key: "telegram.chatId", value: chatId });
  if (!chatIdParsed.success) return settingFieldError("chatId", chatIdParsed.error);
  await setSetting("telegram.chatId", chatId);

  const ogImageParsed = settingInputSchema.safeParse({ key: "site.ogImageUrl", value: ogImageUrl });
  if (!ogImageParsed.success) return settingFieldError("ogImageUrl", ogImageParsed.error);
  await setSetting("site.ogImageUrl", ogImageUrl);

  revalidateAdmin("/admin/settings");
  return { status: "ok", message: "저장했어요" };
});

export const sendTestTelegramAction = adminAction(async (_prev: ActionState, _fd: FormData): Promise<ActionState> => {
  void _prev;
  void _fd;
  const settings = await getSettings();
  const result = await sendTelegramMessage({
    botToken: settings["telegram.botToken"],
    chatId: settings["telegram.chatId"],
    text: "포트폴리오 관리자에서 보낸 테스트 메시지입니다.",
  });
  if (!result.ok) return { status: "error", message: `전송하지 못했어요: ${result.error}` };
  return { status: "ok", message: "테스트 메시지를 보냈어요" };
});
