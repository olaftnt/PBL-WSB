-- AlterTable
ALTER TABLE "TicketAccessoryOption" ADD COLUMN "popularity" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "TicketAccessoryOption_popularity_idx" ON "TicketAccessoryOption"("popularity");
