-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('UNUSED', 'USED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "tier" "UserTier" NOT NULL DEFAULT 'FREE',
    "tierExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivationKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tier" "UserTier" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "KeyStatus" NOT NULL DEFAULT 'UNUSED',
    "userId" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "ActivationKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "restaurantUserId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AlterTable Restaurant - Add new fields
ALTER TABLE "Restaurant" ADD COLUMN "whatsappNumber" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "deliveryFee" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ActivationKey_key_key" ON "ActivationKey"("key");

-- CreateIndex
CREATE INDEX "ActivationKey_key_idx" ON "ActivationKey"("key");

-- CreateIndex
CREATE INDEX "ActivationKey_status_idx" ON "ActivationKey"("status");

-- CreateIndex
CREATE INDEX "Review_restaurantId_idx" ON "Review"("restaurantId");

-- CreateIndex
CREATE INDEX "Review_restaurantUserId_idx" ON "Review"("restaurantUserId");

-- CreateIndex
CREATE INDEX "Review_fingerprint_idx" ON "Review"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Review_restaurantId_fingerprint_key" ON "Review"("restaurantId", "fingerprint");
