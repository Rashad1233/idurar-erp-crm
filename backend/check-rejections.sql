SELECT "itemNumber", "rejectionReason", "rejectionType", "originalItemData" IS NOT NULL as has_original_data 
FROM "RejectionNotifications" 
ORDER BY "rejectedAt" DESC 
LIMIT 3;
