-- CreateTable
CREATE TABLE "TicketAccessoryOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketAccessoryOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketAccessoryOption_normalizedName_key" ON "TicketAccessoryOption"("normalizedName");

-- CreateIndex
CREATE INDEX "TicketAccessoryOption_isDeleted_idx" ON "TicketAccessoryOption"("isDeleted");

-- CreateIndex
CREATE INDEX "TicketAccessoryOption_name_idx" ON "TicketAccessoryOption"("name");

-- Seed default options from the old static list.
INSERT INTO "TicketAccessoryOption" ("id", "name", "normalizedName", "updatedAt")
VALUES
  ('default_accessory_ladowarka', 'Ładowarka', 'ładowarka', CURRENT_TIMESTAMP),
  ('default_accessory_torba', 'Torba', 'torba', CURRENT_TIMESTAMP),
  ('default_accessory_okablowanie', 'Okablowanie', 'okablowanie', CURRENT_TIMESTAMP),
  ('default_accessory_sluchawki', 'Słuchawki', 'słuchawki', CURRENT_TIMESTAMP),
  ('default_accessory_instrukcja_obslugi', 'Instrukcja obsługi', 'instrukcja obsługi', CURRENT_TIMESTAMP)
ON CONFLICT ("normalizedName") DO NOTHING;
