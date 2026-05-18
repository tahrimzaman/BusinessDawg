-- Public build log entries (see prisma/schema.prisma → BuildLogEntry).
CREATE TABLE "BuildLogEntry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "loomUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildLogEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BuildLogEntry_slug_key" ON "BuildLogEntry"("slug");
CREATE INDEX "BuildLogEntry_published_date_idx" ON "BuildLogEntry"("published", "date");
