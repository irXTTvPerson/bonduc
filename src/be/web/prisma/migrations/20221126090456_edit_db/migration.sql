/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[from_account_id,to_account_id]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotifyType" AS ENUM ('FollowRequest', 'AcceptFollowRequest', 'RejectFollowRequest', 'Followed', 'INVALID');

-- DropIndex
DROP INDEX "Follow_id_key";

-- AlterTable
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_pkey",
DROP COLUMN "id";

-- DropTable
DROP TABLE "Notification";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateTable
CREATE TABLE "FollowRequest" (
    "from_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_account_id" TEXT NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AcceptFollowRequest" (
    "from_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_account_id" TEXT NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "RejectFollowRequest" (
    "from_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_account_id" TEXT NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "NotifyFollowed" (
    "from_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_account_id" TEXT NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "FollowRequest_from_account_id_to_account_id_key" ON "FollowRequest"("from_account_id", "to_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "AcceptFollowRequest_from_account_id_to_account_id_key" ON "AcceptFollowRequest"("from_account_id", "to_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "RejectFollowRequest_from_account_id_to_account_id_key" ON "RejectFollowRequest"("from_account_id", "to_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "NotifyFollowed_from_account_id_to_account_id_key" ON "NotifyFollowed"("from_account_id", "to_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_from_account_id_to_account_id_key" ON "Follow"("from_account_id", "to_account_id");

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptFollowRequest" ADD CONSTRAINT "AcceptFollowRequest_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RejectFollowRequest" ADD CONSTRAINT "RejectFollowRequest_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifyFollowed" ADD CONSTRAINT "NotifyFollowed_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
