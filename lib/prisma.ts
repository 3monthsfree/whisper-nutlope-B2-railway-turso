import { PrismaClient } from "@/lib/generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Validate required environment variables in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error(
      "TURSO_DATABASE_URL environment variable is required in production. " +
      "Please set it to your Turso database URL."
    );
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "TURSO_AUTH_TOKEN environment variable is required in production. " +
      "Please set it to your Turso authentication token."
    );
  }
}

// Create Prisma adapter with libSQL config
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create Prisma client with adapter
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
