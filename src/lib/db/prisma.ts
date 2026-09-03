import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;
