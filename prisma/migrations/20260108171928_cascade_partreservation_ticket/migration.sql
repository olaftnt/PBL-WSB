-- DropForeignKey
ALTER TABLE "PartReservation" DROP CONSTRAINT "PartReservation_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
