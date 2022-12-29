/*
  Warnings:

  - The values [global,local,password] on the enum `PodVisibility` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `rp_id` on the `DpPod` table. All the data in the column will be lost.
  - You are about to drop the column `rp_type` on the `DpPod` table. All the data in the column will be lost.
  - You are about to drop the column `rp_id` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `rp_id` on the `QpPod` table. All the data in the column will be lost.
  - You are about to drop the column `rp_type` on the `QpPod` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[account_id,content_id,content_type]` on the table `DpPod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[content_id,account_id]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[account_id,content_id,content_type]` on the table `QpPod` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content_id` to the `DpPod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_type` to the `DpPod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_id` to the `QpPod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content_type` to the `QpPod` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TimelineType" AS ENUM ('home', 'local', 'global');

-- AlterEnum
BEGIN;
CREATE TYPE "PodVisibility_new" AS ENUM ('anyone', 'login', 'following', 'follower', 'mutual', 'mention', 'list', 'myself');
ALTER TABLE "DpPod" ALTER COLUMN "visibility" DROP DEFAULT;
ALTER TABLE "QpPod" ALTER COLUMN "visibility" DROP DEFAULT;
ALTER TABLE "Pod" ALTER COLUMN "visibility" DROP DEFAULT;
ALTER TABLE "Pod" ALTER COLUMN "visibility" TYPE "PodVisibility_new" USING ("visibility"::text::"PodVisibility_new");
ALTER TABLE "DpPod" ALTER COLUMN "visibility" TYPE "PodVisibility_new" USING ("visibility"::text::"PodVisibility_new");
ALTER TABLE "QpPod" ALTER COLUMN "visibility" TYPE "PodVisibility_new" USING ("visibility"::text::"PodVisibility_new");
ALTER TYPE "PodVisibility" RENAME TO "PodVisibility_old";
ALTER TYPE "PodVisibility_new" RENAME TO "PodVisibility";
DROP TYPE "PodVisibility_old";
ALTER TABLE "DpPod" ALTER COLUMN "visibility" SET DEFAULT 'login';
ALTER TABLE "QpPod" ALTER COLUMN "visibility" SET DEFAULT 'login';
ALTER TABLE "Pod" ALTER COLUMN "visibility" SET DEFAULT 'login';
COMMIT;

-- DropIndex
DROP INDEX "DpPod_account_id_rp_id_rp_type_key";

-- DropIndex
DROP INDEX "Favorite_rp_id_account_id_key";

-- DropIndex
DROP INDEX "QpPod_account_id_rp_id_rp_type_key";

-- AlterTable
ALTER TABLE "DpPod" DROP COLUMN "rp_id",
DROP COLUMN "rp_type",
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "content_type" "DpContentType" NOT NULL,
ADD COLUMN     "timeline_type" "TimelineType" NOT NULL DEFAULT 'global',
ALTER COLUMN "visibility" SET DEFAULT 'login';

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "rp_id",
ADD COLUMN     "content_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pod" ADD COLUMN     "timeline_type" "TimelineType" NOT NULL DEFAULT 'global',
ALTER COLUMN "visibility" SET DEFAULT 'login';

-- AlterTable
ALTER TABLE "QpPod" DROP COLUMN "rp_id",
DROP COLUMN "rp_type",
ADD COLUMN     "content_id" TEXT NOT NULL,
ADD COLUMN     "content_type" "QpContentType" NOT NULL,
ADD COLUMN     "timeline_type" "TimelineType" NOT NULL DEFAULT 'global',
ALTER COLUMN "visibility" SET DEFAULT 'login';

-- CreateIndex
CREATE UNIQUE INDEX "DpPod_account_id_content_id_content_type_key" ON "DpPod"("account_id", "content_id", "content_type");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_content_id_account_id_key" ON "Favorite"("content_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "QpPod_account_id_content_id_content_type_key" ON "QpPod"("account_id", "content_id", "content_type");
