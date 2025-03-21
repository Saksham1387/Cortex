-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT DEFAULT 'India',
ADD COLUMN     "countryCode" TEXT DEFAULT 'IN',
ADD COLUMN     "currency" TEXT DEFAULT 'INR',
ADD COLUMN     "googleDomain" TEXT DEFAULT 'google.co.in';
