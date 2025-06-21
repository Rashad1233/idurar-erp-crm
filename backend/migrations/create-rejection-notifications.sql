-- Create rejection notifications table
CREATE TABLE IF NOT EXISTS "RejectionNotifications" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "itemNumber" VARCHAR(255) NOT NULL,
    "shortDescription" TEXT,
    "rejectionReason" TEXT NOT NULL,
    "rejectedById" UUID REFERENCES "Users"(id),
    "rejectedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "idx_rejection_notifications_rejected_at" ON "RejectionNotifications"("rejectedAt");
CREATE INDEX IF NOT EXISTS "idx_rejection_notifications_is_read" ON "RejectionNotifications"("isRead");
