-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartReservation" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Part_sku_key" ON "Part"("sku");

-- CreateIndex
CREATE INDEX "Part_sku_idx" ON "Part"("sku");

-- CreateIndex
CREATE INDEX "Part_quantity_idx" ON "Part"("quantity");

-- CreateIndex
CREATE INDEX "Part_minQuantity_idx" ON "Part"("minQuantity");

-- CreateIndex
CREATE INDEX "PartReservation_partId_idx" ON "PartReservation"("partId");

-- CreateIndex
CREATE INDEX "PartReservation_ticketId_idx" ON "PartReservation"("ticketId");

-- CreateIndex
CREATE INDEX "PartReservation_createdAt_idx" ON "PartReservation"("createdAt");

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
