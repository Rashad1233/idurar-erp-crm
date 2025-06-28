-- Add reorder point field to Inventories table
ALTER TABLE "Inventories" ADD COLUMN "reorderPoint" NUMERIC(10,2) DEFAULT 0;
