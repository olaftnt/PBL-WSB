-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
