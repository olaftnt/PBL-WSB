-- CreateEnum
CREATE TYPE "QuotePublicAccess" AS ENUM ('PUBLIC', 'VIEW_ONLY', 'HIDDEN');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "publicAccess" "QuotePublicAccess" NOT NULL DEFAULT 'HIDDEN';
