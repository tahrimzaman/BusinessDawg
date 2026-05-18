-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateTable
CREATE TABLE "ChatLog" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "model" TEXT NOT NULL,
    "historyLen" INTEGER NOT NULL,
    "totalChars" INTEGER NOT NULL,
    "lastUserMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatLog_createdAt_idx" ON "ChatLog"("createdAt");

-- CreateIndex
CREATE INDEX "ChatLog_ipHash_createdAt_idx" ON "ChatLog"("ipHash", "createdAt");
