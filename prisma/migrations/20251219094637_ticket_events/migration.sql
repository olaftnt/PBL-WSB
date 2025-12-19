/*
  Warnings:

  - The values [STATUS_CHANGED] on the enum `TicketEventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `meta` on the `TicketEvent` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketEventType_new" AS ENUM ('CREATED', 'STATUS', 'NOTE');
ALTER TABLE "TicketEvent" ALTER COLUMN "type" TYPE "TicketEventType_new" USING ("type"::text::"TicketEventType_new");
ALTER TYPE "TicketEventType" RENAME TO "TicketEventType_old";
ALTER TYPE "TicketEventType_new" RENAME TO "TicketEventType";
DROP TYPE "public"."TicketEventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "TicketEvent" DROP COLUMN "meta",
ADD COLUMN     "author" TEXT;
