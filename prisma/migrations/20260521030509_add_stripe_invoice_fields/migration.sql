-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'PAYMENT_FAILED';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "stripeHostedUrl" TEXT,
ADD COLUMN     "taxRate" DOUBLE PRECISION;
