-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "approxLocation" TEXT,
ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "ChatLog" ADD COLUMN     "approxLocation" TEXT,
ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "approxLocation" TEXT,
ADD COLUMN     "country" TEXT;
