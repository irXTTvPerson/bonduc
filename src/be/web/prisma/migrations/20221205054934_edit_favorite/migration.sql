/*
  Warnings:

  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Favorite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pod_id,account_id]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Favorite_id_key";

-- AlterTable
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_pod_id_account_id_key" ON "Favorite"("pod_id", "account_id");
