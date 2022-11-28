-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "follower_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "following_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_pod_at" TIMESTAMP(3),
ADD COLUMN     "pod_count" INTEGER NOT NULL DEFAULT 0;
