/*
  Warnings:

  - The values [OTHER] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_PLUS', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "SizeCategory" AS ENUM ('TOPS', 'BOTTOMS', 'SHOES', 'OUTERWEAR', 'DRESSES');

-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');
ALTER TABLE "User" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserAesthetic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aesthetic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAesthetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSize" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "SizeCategory" NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAesthetic_userId_aesthetic_key" ON "UserAesthetic"("userId", "aesthetic");

-- CreateIndex
CREATE UNIQUE INDEX "UserSize_userId_category_size_key" ON "UserSize"("userId", "category", "size");

-- AddForeignKey
ALTER TABLE "UserAesthetic" ADD CONSTRAINT "UserAesthetic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSize" ADD CONSTRAINT "UserSize_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
