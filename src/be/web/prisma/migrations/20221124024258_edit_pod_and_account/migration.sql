/*
  Warnings:

  - You are about to drop the column `header_url` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `Account` table. All the data in the column will be lost.
  - Added the required column `follower_uri` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `following_uri` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inbox` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outbox` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PodType" AS ENUM ('pod', 'qp', 'dp', 'mention');

-- CreateEnum
CREATE TYPE "PodVisibility" AS ENUM ('anyone', 'login', 'global', 'local', 'following', 'follower', 'mutual', 'mention', 'list', 'password', 'myself');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "header_url",
DROP COLUMN "icon_url",
ADD COLUMN     "follower_uri" TEXT NOT NULL,
ADD COLUMN     "following_uri" TEXT NOT NULL,
ADD COLUMN     "header_uri" TEXT NOT NULL DEFAULT '/img/default_header.png',
ADD COLUMN     "icon_uri" TEXT NOT NULL DEFAULT '/img/default_icon.png',
ADD COLUMN     "inbox" TEXT NOT NULL,
ADD COLUMN     "outbox" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pod" ADD COLUMN     "rp_from_id" TEXT,
ADD COLUMN     "type" "PodType" NOT NULL DEFAULT 'pod',
ADD COLUMN     "visibility" "PodVisibility" NOT NULL DEFAULT 'global';
