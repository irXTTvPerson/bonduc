/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `DraftAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `DraftAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DraftAccount" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DraftAccount_token_key" ON "DraftAccount"("token");
