-- Rename username to email on Agent table
ALTER TABLE "Agent" RENAME COLUMN "username" TO "email";

-- Rename the unique index
ALTER INDEX "Agent_username_key" RENAME TO "Agent_email_key";

-- Add createdByAgentEmail to Invoice
ALTER TABLE "Invoice" ADD COLUMN "createdByAgentEmail" TEXT;
