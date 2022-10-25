/*
  Warnings:

  - You are about to drop the column `from_account_id` on the `Pod` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `Pod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pod" DROP COLUMN "from_account_id",
ADD COLUMN     "account_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Pod" ADD CONSTRAINT "Pod_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
