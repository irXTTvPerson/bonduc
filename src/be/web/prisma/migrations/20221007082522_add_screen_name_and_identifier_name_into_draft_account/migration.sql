/*
  Warnings:

  - A unique constraint covering the columns `[identifier_name]` on the table `DraftAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier_name` to the `DraftAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `screen_name` to the `DraftAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DraftAccount" ADD COLUMN     "identifier_name" TEXT NOT NULL,
ADD COLUMN     "screen_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DraftAccount_identifier_name_key" ON "DraftAccount"("identifier_name");
