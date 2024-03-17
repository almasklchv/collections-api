-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_userId_fkey";

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
