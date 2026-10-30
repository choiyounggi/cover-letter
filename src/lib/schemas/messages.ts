import { z } from "zod";

export const CONTACT_CONTENT_MAX = 300;

export const contactEmailSchema = z.email({ error: "올바른 이메일 형식이 아니에요." }).max(200);

export const messageInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: contactEmailSchema,
  content: z
    .string()
    // multipart encoding turns each textarea "\n" into "\r\n"; count line breaks as the browser's counter does
    .overwrite((s) => s.replace(/\r\n?/g, "\n"))
    .trim()
    .min(1)
    .max(CONTACT_CONTENT_MAX, { error: `내용은 ${CONTACT_CONTENT_MAX}자 이내로 입력해 주세요.` }),
  website: z.string().max(0).optional(),
});
export type MessageInput = z.input<typeof messageInputSchema>;
export type MessageData = z.output<typeof messageInputSchema>;
