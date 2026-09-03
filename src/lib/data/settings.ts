import { prisma } from "@/lib/db/prisma";
import { settingInputSchema, SETTING_KEYS, type SettingKey } from "@/lib/schemas/settings";

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? "";
}

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: [...SETTING_KEYS] } } });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(SETTING_KEYS.map((key) => [key, byKey.get(key) ?? ""])) as Record<
    SettingKey,
    string
  >;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  const data = settingInputSchema.parse({ key, value });
  await prisma.setting.upsert({
    where: { key: data.key },
    create: data,
    update: { value: data.value },
  });
}
