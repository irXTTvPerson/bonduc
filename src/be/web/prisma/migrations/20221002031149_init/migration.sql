-- CreateTable
CREATE TABLE "DraftAccount" (
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "family" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DraftAccount_email_key" ON "DraftAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DraftAccount_address_key" ON "DraftAccount"("address");
