-- CreateTable
CREATE TABLE "TicketChecklistItem" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketChecklistItem_ticketId_idx" ON "TicketChecklistItem"("ticketId");

-- AddForeignKey
ALTER TABLE "TicketChecklistItem" ADD CONSTRAINT "TicketChecklistItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
