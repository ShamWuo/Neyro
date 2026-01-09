-- CreateTable
CREATE TABLE "ResourceCollectionTag" (
    "id" TEXT NOT NULL,
    "resourceCollectionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceCollectionTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResourceCollectionTag_resourceCollectionId_idx" ON "ResourceCollectionTag"("resourceCollectionId");

-- CreateIndex
CREATE INDEX "ResourceCollectionTag_tagId_idx" ON "ResourceCollectionTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCollectionTag_resourceCollectionId_tagId_key" ON "ResourceCollectionTag"("resourceCollectionId", "tagId");

-- AddForeignKey
ALTER TABLE "ResourceCollectionTag" ADD CONSTRAINT "ResourceCollectionTag_resourceCollectionId_fkey" FOREIGN KEY ("resourceCollectionId") REFERENCES "ResourceCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceCollectionTag" ADD CONSTRAINT "ResourceCollectionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
