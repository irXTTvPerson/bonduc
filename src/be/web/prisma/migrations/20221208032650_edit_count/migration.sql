/*
  Warnings:

  - You are about to drop the column `dp_count` on the `Pod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "dp_count",
ADD COLUMN     "rp_count" INTEGER NOT NULL DEFAULT 0;
