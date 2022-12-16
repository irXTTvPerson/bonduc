/*
  Warnings:

  - You are about to drop the column `rp_from_id` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Pod` table. All the data in the column will be lost.
  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Setting" DROP CONSTRAINT "Setting_account_id_fkey";

-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "rp_from_id",
DROP COLUMN "type",
ADD COLUMN     "dp_count" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Setting";

-- DropEnum
DROP TYPE "PodType";

-- CreateTable
CREATE TABLE "DpPod" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to" JSONB NOT NULL,
    "cc" JSONB,
    "account_id" TEXT NOT NULL,
    "visibility" "PodVisibility" NOT NULL DEFAULT 'global',
    "pod_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DpPod_account_id_pod_id_key" ON "DpPod"("account_id", "pod_id");

-- AddForeignKey
ALTER TABLE "DpPod" ADD CONSTRAINT "DpPod_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DpPod" ADD CONSTRAINT "DpPod_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
