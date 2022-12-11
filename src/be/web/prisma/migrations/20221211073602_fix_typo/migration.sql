/*
  Warnings:

  - You are about to drop the column `dp_count` on the `QpPod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QpPod" DROP COLUMN "dp_count",
ADD COLUMN     "rp_count" INTEGER NOT NULL DEFAULT 0;
