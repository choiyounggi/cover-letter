"use server";

import { z } from "zod";
import { messageInputSchema } from "@/lib/schemas/messages";
import { createMessage, getSettings, markTelegramSent } from "@/lib/data";
import { formatContactMessage, sendTelegramMessage } from "@/lib/telegram";

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message?: string; fieldErrors?: Partial<Record<"name" | "email" | "content", string[]>> };

const GENERIC = "잠시 후 다시 시도해 주세요.";

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData) as Record<string, unknown>;
  if (typeof raw.website === "string" && raw.website.length > 0) return { status: "ok" }; // honeypot

  const parsed = messageInputSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { status: "error", fieldErrors: { name: fieldErrors.name, email: fieldErrors.email, content: fieldErrors.content } };
  }

  let message;
  try {
    message = await createMessage(parsed.data);
  } catch {
    return { status: "error", message: GENERIC };
  }

  try {
    const settings = await getSettings();
    const sent = await sendTelegramMessage({
      botToken: settings["telegram.botToken"] ?? "",
      chatId: settings["telegram.chatId"] ?? "",
      text: formatContactMessage({
        name: message.name,
        email: message.email,
        content: message.content,
        createdAt: message.createdAt,
      }),
    });
    if (sent.ok) await markTelegramSent(message.id);
  } catch {
    /* message is already stored; a post-create failure must not fail the visitor */
  }

  return { status: "ok" };
}
