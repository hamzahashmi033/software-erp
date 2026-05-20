-- CreateEnum
CREATE TYPE "Department" AS ENUM ('FRONT', 'UPSELL');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentMerchant" AS ENUM ('STRIPE');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripeCustomerId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "descriptionHtml" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentMerchant" "PaymentMerchant" NOT NULL DEFAULT 'STRIPE',
    "stripePayUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceView" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveViewer" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveViewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_department_idx" ON "Invoice"("department");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "InvoiceView_invoiceId_idx" ON "InvoiceView"("invoiceId");

-- CreateIndex
CREATE INDEX "ActiveViewer_invoiceId_lastSeen_idx" ON "ActiveViewer"("invoiceId", "lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveViewer_invoiceId_sessionId_key" ON "ActiveViewer"("invoiceId", "sessionId");

-- AddForeignKey
ALTER TABLE "InvoiceView" ADD CONSTRAINT "InvoiceView_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveViewer" ADD CONSTRAINT "ActiveViewer_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
