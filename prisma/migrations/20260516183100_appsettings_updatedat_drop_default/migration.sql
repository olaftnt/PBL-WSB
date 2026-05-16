-- Align with Prisma @updatedAt semantics (bez DEFAULT w Postgres)
ALTER TABLE "AppSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;
