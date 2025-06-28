-- Delegation of Financial Authority (DoFA) Schema

-- DoFA Levels Table - Defines approval thresholds and associated approvers
CREATE TABLE IF NOT EXISTS public."DoFALevels" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "minAmount" DECIMAL(15, 2) DEFAULT 0,
  "maxAmount" DECIMAL(15, 2) NOT NULL,
  "approverId" UUID REFERENCES public."Users"("id"),
  "position" INTEGER NOT NULL, -- For ordering in the approval chain
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdById" UUID REFERENCES public."Users"("id"),
  "updatedById" UUID REFERENCES public."Users"("id"),
  CONSTRAINT "unique_dofa_position" UNIQUE ("position")
);

-- DoFA Cost Centers - Links cost centers to specific DoFA approvers
CREATE TABLE IF NOT EXISTS public."DoFACostCenters" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "costCenterId" VARCHAR(50) NOT NULL,
  "costCenterName" VARCHAR(255),
  "dofaLevelId" UUID REFERENCES public."DoFALevels"("id"),
  "approverId" UUID REFERENCES public."Users"("id"),
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdById" UUID REFERENCES public."Users"("id"),
  "updatedById" UUID REFERENCES public."Users"("id")
);

-- Approval Workflows - Track multi-step approval processes
CREATE TABLE IF NOT EXISTS public."ApprovalWorkflows" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "documentType" VARCHAR(50) NOT NULL, -- PR, RFQ, PO
  "documentId" UUID NOT NULL,
  "currentStep" INTEGER DEFAULT 0,
  "totalSteps" INTEGER DEFAULT 0,
  "isCompleted" BOOLEAN DEFAULT FALSE,
  "currentApproverId" UUID REFERENCES public."Users"("id"),
  "nextApproverId" UUID REFERENCES public."Users"("id"),
  "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Steps - Individual approval steps in a workflow
CREATE TABLE IF NOT EXISTS public."ApprovalSteps" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workflowId" UUID REFERENCES public."ApprovalWorkflows"("id"),
  "stepNumber" INTEGER NOT NULL,
  "approverId" UUID REFERENCES public."Users"("id"),
  "status" VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, skipped
  "comments" TEXT,
  "action" VARCHAR(50),
  "processedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add DoFA reference to purchase requisitions
ALTER TABLE IF EXISTS public."PurchaseRequisitions" 
  ADD COLUMN IF NOT EXISTS "dofaWorkflowId" UUID REFERENCES public."ApprovalWorkflows"("id");

-- Add DoFA reference to other procurement documents
ALTER TABLE IF EXISTS public."RFQs" 
  ADD COLUMN IF NOT EXISTS "dofaWorkflowId" UUID REFERENCES public."ApprovalWorkflows"("id");

ALTER TABLE IF EXISTS public."PurchaseOrders" 
  ADD COLUMN IF NOT EXISTS "dofaWorkflowId" UUID REFERENCES public."ApprovalWorkflows"("id");
