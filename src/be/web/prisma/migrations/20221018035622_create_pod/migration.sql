-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "to" JSONB NOT NULL,
    "cc" JSONB,
    "from_account_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "Pod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pod_id_key" ON "Pod"("id");
