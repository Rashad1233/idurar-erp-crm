SELECT id, "itemNumber", "shortDescription", status FROM "ItemMasters" WHERE status = 'PENDING_REVIEW' ORDER BY id DESC LIMIT 5;
