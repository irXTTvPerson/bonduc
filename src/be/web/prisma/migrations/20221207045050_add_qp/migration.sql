/*
  Warnings:

  - You are about to drop the column `pod_id` on the `DpPod` table. All the data in the column will be lost.
  - You are about to drop the column `pod_id` on the `Favorite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `DpPod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id,rp_id]` on the table `DpPod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rp_id,account_id]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rp_id` to the `DpPod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rp_id` to the `Favorite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DpPod" DROP CONSTRAINT "DpPod_pod_id_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_pod_id_fkey";

-- DropIndex
DROP INDEX "DpPod_account_id_pod_id_key";

-- DropIndex
DROP INDEX "Favorite_pod_id_account_id_key";

-- AlterTable
ALTER TABLE "DpPod" DROP COLUMN "pod_id",
ADD COLUMN     "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "rp_id" TEXT NOT NULL,
ADD CONSTRAINT "DpPod_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "pod_id",
ADD COLUMN     "rp_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "QpPod" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "to" TEXT[],
    "cc" TEXT[],
    "account_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "dp_count" INTEGER NOT NULL DEFAULT 0,
    "visibility" "PodVisibility" NOT NULL DEFAULT 'global',
    "pod_id" TEXT NOT NULL,

    CONSTRAINT "QpPod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QpPod_id_key" ON "QpPod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "QpPod_account_id_pod_id_key" ON "QpPod"("account_id", "pod_id");

-- CreateIndex
CREATE UNIQUE INDEX "DpPod_id_key" ON "DpPod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DpPod_account_id_rp_id_key" ON "DpPod"("account_id", "rp_id");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_rp_id_account_id_key" ON "Favorite"("rp_id", "account_id");

-- AddForeignKey
ALTER TABLE "QpPod" ADD CONSTRAINT "QpPod_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
