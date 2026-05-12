-- CreateTable
CREATE TABLE "RepairProtocol" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "performedWork" TEXT NOT NULL,
    "repairCost" DECIMAL(10,2) NOT NULL,
    "servicePerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairProtocol_ticketId_key" ON "RepairProtocol"("ticketId");

-- AddForeignKey
ALTER TABLE "RepairProtocol" ADD CONSTRAINT "RepairProtocol_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
