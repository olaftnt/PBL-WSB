-- CreateEnum
CREATE TYPE "TicketEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'NOTE');

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_customerId_fkey";

-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Customer_name_idx";

-- DropIndex
DROP INDEX "Device_customerId_idx";

-- DropIndex
DROP INDEX "Device_serial_idx";

-- CreateTable
CREATE TABLE "TicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "type" "TicketEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketEvent_ticketId_idx" ON "TicketEvent"("ticketId");

-- CreateIndex
CREATE INDEX "TicketEvent_createdAt_idx" ON "TicketEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEvent" ADD CONSTRAINT "TicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
