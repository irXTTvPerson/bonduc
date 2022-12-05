/*
  Warnings:

  - The `ip_address` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `to` column on the `DpPod` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cc` column on the `DpPod` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `to` column on the `Pod` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cc` column on the `Pod` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "ip_address",
ADD COLUMN     "ip_address" TEXT[];

-- AlterTable
ALTER TABLE "DpPod" DROP COLUMN "to",
ADD COLUMN     "to" TEXT[],
DROP COLUMN "cc",
ADD COLUMN     "cc" TEXT[];

-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "to",
ADD COLUMN     "to" TEXT[],
DROP COLUMN "cc",
ADD COLUMN     "cc" TEXT[];
