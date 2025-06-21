-- Migrate RejectionNotifications to a more generic Notifications table
-- This will support both rejection and approval notifications

-- First, create the new Notifications table
CREATE TABLE IF NOT EXISTS "Notifications" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "itemId" UUID,
    "itemNumber" VARCHAR(255),
    "shortDescription" TEXT,
    "notificationType" VARCHAR(50) NOT NULL, -- 'REJECTION' or 'APPROVAL'
    "actionById" UUID, -- The user who performed the action (rejected/approved)
    "actionAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "message" TEXT, -- Generic message (rejection reason or approval message)
    "isRead" BOOLEAN DEFAULT false,
    "originalItemData" JSONB, -- For rejections, store original item data
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_notification_action_user FOREIGN KEY ("actionById") REFERENCES "Users"(id) ON DELETE SET NULL
);

-- Copy data from RejectionNotifications to Notifications
INSERT INTO "Notifications" (
    id, 
    "itemNumber", 
    "shortDescription", 
    "notificationType", 
    "actionById", 
    "actionAt", 
    "message", 
    "isRead", 
    "originalItemData", 
    "createdAt", 
    "updatedAt"
)
SELECT 
    id,
    "itemNumber",
    "shortDescription",
    'REJECTION' as "notificationType",
    "rejectedById" as "actionById",
    "rejectedAt" as "actionAt",
    "rejectionReason" as "message",
    "isRead",
    "originalItemData",
    "createdAt",
    "updatedAt"
FROM "RejectionNotifications";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON "Notifications"("notificationType");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON "Notifications"("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_action_at ON "Notifications"("actionAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_action_by ON "Notifications"("actionById");

-- Verify the migration
SELECT 
    "notificationType",
    COUNT(*) as count,
    COUNT(CASE WHEN "isRead" = false THEN 1 END) as unread_count
FROM "Notifications" 
GROUP BY "notificationType"
ORDER BY "notificationType";
