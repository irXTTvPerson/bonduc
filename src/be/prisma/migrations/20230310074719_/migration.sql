-- CreateEnum
CREATE TYPE "PodVisibility" AS ENUM ('anyone', 'myself');

-- CreateEnum
CREATE TYPE "TimelineType" AS ENUM ('home', 'local', 'social', 'global');

-- CreateEnum
CREATE TYPE "PodType" AS ENUM ('pod', 'quote', 'duplicate', 'reply', 'encrypted', 'partial');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'audio', 'other');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ip_address" TEXT[],
    "screen_name" TEXT NOT NULL,
    "identifier_name" TEXT NOT NULL,
    "header_uri" TEXT NOT NULL DEFAULT '/img/default_header.png',
    "icon_uri" TEXT NOT NULL DEFAULT '/img/default_icon.png',
    "unique_uri" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pod" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3),
    "reveal_at" TIMESTAMP(3),
    "account_id" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "has_media" BOOLEAN NOT NULL,
    "nsfw" BOOLEAN NOT NULL,
    "read_more" BOOLEAN NOT NULL,
    "root_thread_id" TEXT,
    "visibility" "PodVisibility" NOT NULL,
    "timeline_type" "TimelineType" NOT NULL,
    "pod_type" "PodType" NOT NULL,

    CONSTRAINT "Pod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_at" TIMESTAMP(3),
    "account_id" TEXT NOT NULL,
    "pod_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'image',

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_identifier_name_key" ON "Account"("identifier_name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_unique_uri_key" ON "Account"("unique_uri");

-- CreateIndex
CREATE UNIQUE INDEX "Pod_id_key" ON "Pod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Media_id_key" ON "Media"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

-- AddForeignKey
ALTER TABLE "Pod" ADD CONSTRAINT "Pod_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_pod_id_fkey" FOREIGN KEY ("pod_id") REFERENCES "Pod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
