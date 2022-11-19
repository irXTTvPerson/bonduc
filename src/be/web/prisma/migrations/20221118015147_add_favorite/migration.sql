-- AlterTable
ALTER TABLE "Pod" ADD COLUMN     "favorite_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pod_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_id_key" ON "Favorite"("id");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
