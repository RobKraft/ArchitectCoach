-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false;
