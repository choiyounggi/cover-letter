import { z } from "zod";

export const messageInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  content: z.string().trim().min(1).max(5000),
  website: z.string().max(0).optional(),
});
export type MessageInput = z.input<typeof messageInputSchema>;
export type MessageData = z.output<typeof messageInputSchema>;
