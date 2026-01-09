-- CreateTable
CREATE TABLE "AreaHealthHistory" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AreaHealthHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AreaHealthHistory_areaId_date_idx" ON "AreaHealthHistory"("areaId", "date");

-- CreateIndex
CREATE INDEX "AreaHealthHistory_userId_date_idx" ON "AreaHealthHistory"("userId", "date");

-- AddForeignKey
ALTER TABLE "AreaHealthHistory" ADD CONSTRAINT "AreaHealthHistory_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaHealthHistory" ADD CONSTRAINT "AreaHealthHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
