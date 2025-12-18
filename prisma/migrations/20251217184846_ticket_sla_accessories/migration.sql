-- CreateEnum
CREATE TYPE "SLATYPE" AS ENUM ('STANDARD', 'EXPRESS', 'VIP', 'WARRANTY');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "accessories" TEXT[],
ADD COLUMN     "physicalCondition" TEXT,
ADD COLUMN     "slaType" "SLATYPE" NOT NULL DEFAULT 'STANDARD';

-- CreateIndex
CREATE INDEX "Ticket_customerId_idx" ON "Ticket"("customerId");

-- CreateIndex
CREATE INDEX "Ticket_deviceId_idx" ON "Ticket"("deviceId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");

-- CreateIndex
CREATE INDEX "Ticket_slaType_idx" ON "Ticket"("slaType");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");
