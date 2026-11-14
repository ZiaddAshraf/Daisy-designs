CREATE TABLE "TelegramOrderNotice" (
    "orderId" TEXT PRIMARY KEY REFERENCES "Order"("id") ON DELETE CASCADE,
    "nextPart" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3)
);
CREATE INDEX "TelegramOrderNotice_acceptedAt_availableAt_idx" ON "TelegramOrderNotice"("acceptedAt", "availableAt");
