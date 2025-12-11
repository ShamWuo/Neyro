-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('NOTE', 'TASK', 'LINK');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "ItemType" NOT NULL DEFAULT 'NOTE';
