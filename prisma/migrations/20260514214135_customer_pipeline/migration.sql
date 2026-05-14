-- CreateEnum
CREATE TYPE "CustomerStage" AS ENUM ('PROSPECT', 'ACTIVE', 'DELIVERED', 'CHURNED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "serviceDescription" TEXT NOT NULL DEFAULT '',
    "desiredDeadline" TIMESTAMP(3),
    "pricingNotes" TEXT,
    "internalNotes" TEXT,
    "stage" "CustomerStage" NOT NULL DEFAULT 'PROSPECT',
    "promotedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_bookingId_key" ON "Customer"("bookingId");

-- CreateIndex
CREATE INDEX "Customer_stage_idx" ON "Customer"("stage");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_desiredDeadline_idx" ON "Customer"("desiredDeadline");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
