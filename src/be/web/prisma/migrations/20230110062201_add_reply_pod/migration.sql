/*
  Warnings:

  - A unique constraint covering the columns `[inbox]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[outbox]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[follower_uri]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[following_uri]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReplyType" AS ENUM ('pod', 'qp', 'reply');

-- AlterTable
ALTER TABLE "Pod" ADD COLUMN     "reply_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QpPod" ADD COLUMN     "reply_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReplyPod" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "to" TEXT[],
    "cc" TEXT[],
    "account_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "rp_count" INTEGER NOT NULL DEFAULT 0,
    "visibility" "PodVisibility" NOT NULL DEFAULT 'login',
    "reply_to_id" TEXT NOT NULL,
    "timeline_type" "TimelineType" NOT NULL DEFAULT 'global',
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "thread_id" TEXT NOT NULL,
    "reply_type" "ReplyType" NOT NULL,

    CONSTRAINT "ReplyPod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotifyReplyed" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "from_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to_account_id" TEXT NOT NULL,
    "opened" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotifyReplyed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplyPod_id_key" ON "ReplyPod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NotifyReplyed_id_key" ON "NotifyReplyed"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_inbox_key" ON "Account"("inbox");

-- CreateIndex
CREATE UNIQUE INDEX "Account_outbox_key" ON "Account"("outbox");

-- CreateIndex
CREATE UNIQUE INDEX "Account_follower_uri_key" ON "Account"("follower_uri");

-- CreateIndex
CREATE UNIQUE INDEX "Account_following_uri_key" ON "Account"("following_uri");

-- AddForeignKey
ALTER TABLE "ReplyPod" ADD CONSTRAINT "ReplyPod_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifyReplyed" ADD CONSTRAINT "NotifyReplyed_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
