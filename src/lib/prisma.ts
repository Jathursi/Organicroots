import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const directUrl = process.env.DIRECT_URL;
const shouldUseDirectUrlInDev =
  process.env.NODE_ENV !== "production" &&
  typeof directUrl === "string" &&
  directUrl.startsWith("postgresql://");

const prismaOptions = shouldUseDirectUrlInDev
  ? {
      datasources: {
        db: {
          url: directUrl,
        },
      },
    }
  : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
