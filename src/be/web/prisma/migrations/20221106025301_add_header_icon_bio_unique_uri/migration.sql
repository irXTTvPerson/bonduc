/*
  Warnings:

  - A unique constraint covering the columns `[account_unique_uri]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_unique_uri` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "account_unique_uri" TEXT NOT NULL,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "header_url" TEXT NOT NULL DEFAULT '/img/default_header.png',
ADD COLUMN     "icon_url" TEXT NOT NULL DEFAULT '/img/default_icon.png';

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_unique_uri_key" ON "Account"("account_unique_uri");
