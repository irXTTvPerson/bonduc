/*
  Warnings:

  - You are about to drop the column `pod_id` on the `QpPod` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id,rp_id,rp_type]` on the table `DpPod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id,rp_id,rp_type]` on the table `QpPod` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rp_type` to the `DpPod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rp_id` to the `QpPod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rp_type` to the `QpPod` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DpContentType" AS ENUM ('pod', 'qp');

-- CreateEnum
CREATE TYPE "QpContentType" AS ENUM ('pod', 'qp');

-- DropIndex
DROP INDEX "DpPod_account_id_rp_id_key";

-- DropIndex
DROP INDEX "QpPod_account_id_pod_id_key";

-- AlterTable
ALTER TABLE "DpPod" ADD COLUMN     "rp_type" "DpContentType" NOT NULL;

-- AlterTable
ALTER TABLE "QpPod" DROP COLUMN "pod_id",
ADD COLUMN     "rp_id" TEXT NOT NULL,
ADD COLUMN     "rp_type" "QpContentType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DpPod_account_id_rp_id_rp_type_key" ON "DpPod"("account_id", "rp_id", "rp_type");

-- CreateIndex
CREATE UNIQUE INDEX "QpPod_account_id_rp_id_rp_type_key" ON "QpPod"("account_id", "rp_id", "rp_type");
