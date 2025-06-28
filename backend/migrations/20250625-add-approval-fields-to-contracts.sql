-- Migration: Add approval fields to Contracts table for contract approval workflow
ALTER TABLE "Contracts"
ADD COLUMN IF NOT EXISTS "approvalStatus" VARCHAR(32) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "approvalDate" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "approvedById" UUID;
