import { prisma } from "@/lib/db/prisma";
import { messageInputSchema, type MessageInput } from "@/lib/schemas/messages";
import type { Message } from "@/generated/prisma/client";

export async function createMessage(input: MessageInput): Promise<Message> {
  const { name, email, content, website } = messageInputSchema.parse(input);
  if (website) throw new Error("Spam detected");
  return prisma.message.create({ data: { name, email, content } });
}

export async function listMessages(opts: { take?: number; cursor?: string } = {}): Promise<Message[]> {
  const { take = 50, cursor } = opts;
  return prisma.message.findMany({
    take,
    orderBy: { createdAt: "desc" },
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });
}

export async function markMessageRead(id: string): Promise<Message> {
  return prisma.message.update({ where: { id }, data: { readAt: new Date() } });
}

export async function markTelegramSent(id: string): Promise<Message> {
  return prisma.message.update({ where: { id }, data: { telegramSentAt: new Date() } });
}

export async function deleteMessage(id: string): Promise<Message> {
  return prisma.message.delete({ where: { id } });
}
