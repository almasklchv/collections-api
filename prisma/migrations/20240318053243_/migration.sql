-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_collection_id_fkey";

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
