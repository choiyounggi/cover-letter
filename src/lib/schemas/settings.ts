import { z } from "zod";

export const SETTING_KEYS = ["telegram.botToken", "telegram.chatId", "site.ogImageUrl"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export const settingInputSchema = z.object({
  key: z.enum(SETTING_KEYS),
  value: z.string().max(2000),
});
export type SettingInput = z.input<typeof settingInputSchema>;
export type SettingData = z.output<typeof settingInputSchema>;
