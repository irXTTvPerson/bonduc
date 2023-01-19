/*
  Warnings:

  - You are about to drop the column `reply_type` on the `ReplyPod` table. All the data in the column will be lost.
  - You are about to drop the column `thread_id` on the `ReplyPod` table. All the data in the column will be lost.
  - Added the required column `reply_to_type` to the `ReplyPod` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReplyToType" AS ENUM ('pod', 'qp', 'reply');

-- AlterEnum
ALTER TYPE "DpContentType" ADD VALUE 'reply';

-- AlterEnum
ALTER TYPE "QpContentType" ADD VALUE 'reply';

-- AlterTable
ALTER TABLE "ReplyPod" DROP COLUMN "reply_type",
DROP COLUMN "thread_id",
ADD COLUMN     "reply_to_type" "ReplyToType" NOT NULL;

-- DropEnum
DROP TYPE "ReplyType";
