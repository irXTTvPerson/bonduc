/*
  Warnings:

  - You are about to drop the column `context_uri` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "context_uri",
ADD COLUMN     "context" TEXT,
ALTER COLUMN "opened" SET DEFAULT false;
