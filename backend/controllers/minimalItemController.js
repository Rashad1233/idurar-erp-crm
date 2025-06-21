// Working itemMasterController for pending review functionality
const { ItemMaster, User, UnspscCode, Inventory, RejectionNotification, sequelize } = require('../models/sequelize');

// Get all items (for the main view)
exports.getItemMasters = async (req, res) => {
  console.log('🔥 getItemMasters CALLED');
  try {
    const { page = 1, items: itemsPerPage = 20, category, criticality, search } = req.query;
    const offset = (page - 1) * itemsPerPage;
    
    console.log('Query params:', { page, itemsPerPage, category, criticality, search });
    
    // Build where conditions
    let whereConditions = ['1=1']; // Always true condition to start
    
    if (category) {
      whereConditions.push(`i."equipmentCategory" = '${category}'`);
    }
    
    if (criticality) {
      whereConditions.push(`i.criticality = '${criticality}'`);
    }
    
    if (search) {
      whereConditions.push(`(
        i."itemNumber" ILIKE '%${search}%' OR 
        i."shortDescription" ILIKE '%${search}%' OR 
        i."standardDescription" ILIKE '%${search}%' OR 
        i."manufacturerName" ILIKE '%${search}%' OR 
        i."manufacturerPartNumber" ILIKE '%${search}%'
      )`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    console.log('📋 SQL WHERE clause:', whereClause);

    // Use direct SQL query
    const [rawItems] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             r.name as "reviewedByName", r.email as "reviewedByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" r ON i."reviewedById" = r.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      WHERE ${whereClause}
      ORDER BY i."updatedAt" DESC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `);
    
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "ItemMasters" i
      WHERE ${whereClause}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || 0);
    
    console.log(`✅ Found ${totalCount} total items, returning ${rawItems.length} items`);

    res.status(200).json({
      success: true,
      count: totalCount,
      data: rawItems,
      pagination: {
        page: parseInt(page),
        items: parseInt(itemsPerPage),
        total: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      },
      message: `${totalCount} items found`
    });

  } catch (error) {
    console.error('❌ Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getItemsPendingReview = async (req, res) => {
  console.log('🔥 WORKING getItemsPendingReview CALLED!');
  try {
    console.log('🚀 DEBUG: Function called successfully');
    
    const { page = 1, items: itemsPerPage = 20, category, criticality, search } = req.query;
    const offset = (page - 1) * itemsPerPage;
    
    console.log('Query params:', { page, itemsPerPage, category, criticality, search });
    
    // Build where conditions
    let whereConditions = [`i.status = 'PENDING_REVIEW'`];
    
    if (category) {
      whereConditions.push(`i."equipmentCategory" = '${category}'`);
    }
    
    if (criticality) {
      whereConditions.push(`i.criticality = '${criticality}'`);
    }
    
    if (search) {
      whereConditions.push(`(
        i."itemNumber" ILIKE '%${search}%' OR 
        i."shortDescription" ILIKE '%${search}%' OR 
        i."standardDescription" ILIKE '%${search}%' OR 
        i."manufacturerName" ILIKE '%${search}%' OR 
        i."manufacturerPartNumber" ILIKE '%${search}%'
      )`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    console.log('📋 SQL WHERE clause:', whereClause);

    // Use direct SQL query
    const [rawItems] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             r.name as "reviewedByName", r.email as "reviewedByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" r ON i."reviewedById" = r.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      WHERE ${whereClause}
      ORDER BY i."updatedAt" ASC, 
               CASE i.criticality 
                 WHEN 'HIGH' THEN 1 
                 WHEN 'MEDIUM' THEN 2 
                 WHEN 'LOW' THEN 3 
                 ELSE 4 
               END,
               i."createdAt" ASC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `);
    
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "ItemMasters" i
      WHERE ${whereClause}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || 0);
    
    console.log(`✅ Found ${totalCount} items pending review, returning ${rawItems.length} items`);

    res.status(200).json({
      success: true,
      count: totalCount,
      data: rawItems,
      pagination: {
        page: parseInt(page),
        items: parseInt(itemsPerPage),
        total: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      },
      message: `${totalCount} items pending review`
    });

  } catch (error) {
    console.error('❌ Get pending review items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items pending review',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Approve/Reject item functionality
exports.reviewItemMaster = async (req, res) => {
  console.log('🔥 reviewItemMaster CALLED!');  try {
    const { id } = req.params;
    const { action, rejectionReason, rejectionType = 'DELETE' } = req.body;
    const reviewerId = req.user?.id || '0b4afa3e-8582-452b-833c-f8bf695c4d60';

    console.log('Review request:', { id, action, rejectionReason, rejectionType, reviewerId });

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an item'
      });
    }

    if (action === 'reject' && !['DELETE', 'ALLOW_EDIT'].includes(rejectionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rejection type. Must be "DELETE" or "ALLOW_EDIT"'
      });
    }

    // Get the item first
    const [items] = await sequelize.query(`
      SELECT * FROM "ItemMasters" WHERE id = $1
    `, {
      bind: [id]
    });

    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const item = items[0];

    if (item.status !== 'PENDING_REVIEW') {
      return res.status(400).json({
        success: false,
        message: 'Item is not pending review'
      });
    }

    if (action === 'approve') {
      // Generate final item number for approved items
      let finalItemNumber = item.itemNumber;
      if (item.itemNumber.startsWith('TEMP-')) {
        finalItemNumber = generateFinalItemNumber(item);
      }

      // Update the item status to approved
      await sequelize.query(`
        UPDATE "ItemMasters" 
        SET 
          status = 'APPROVED',
          "itemNumber" = $1,
          "reviewedById" = $2,
          "reviewedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE id = $3
      `, {
        bind: [finalItemNumber, reviewerId, id]
      });      // Create approval notification
      await sequelize.query(`
        INSERT INTO "Notifications" 
        ("itemId", "itemNumber", "shortDescription", "notificationType", "actionById", "actionAt", "message", "isRead")
        VALUES ($1, $2, $3, 'APPROVAL', $4, NOW(), $5, false)
      `, {
        bind: [
          id,
          finalItemNumber,
          item.shortDescription,
          reviewerId,
          `Item "${item.shortDescription}" has been approved with item number ${finalItemNumber}`
        ]
      });

      console.log(`✅ Item approved successfully with number: ${finalItemNumber}`);

      res.status(200).json({
        success: true,
        message: `Item approved successfully with number ${finalItemNumber}`,
        data: {
          id,
          status: 'APPROVED',
          itemNumber: finalItemNumber
        }
      });} else if (action === 'reject') {
      // Store complete item data for potential recreation
      const originalItemData = {
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        standardDescription: item.standardDescription,
        manufacturerName: item.manufacturerName,
        manufacturerPartNumber: item.manufacturerPartNumber,
        equipmentCategory: item.equipmentCategory,
        equipmentSubCategory: item.equipmentSubCategory,
        criticality: item.criticality,
        uom: item.uom,
        stockItem: item.stockItem,
        plannedStock: item.plannedStock,
        unspscCodeId: item.unspscCodeId,
        unspscCode: item.unspscCode,
        supplierName: item.supplierName,
        contractNumber: item.contractNumber,
        equipmentTag: item.equipmentTag,
        serialNumber: item.serialNumber,
        createdById: item.createdById
      };      // Create notification record with original data and rejection type
      await sequelize.query(`
        INSERT INTO "Notifications" 
        ("itemId", "itemNumber", "shortDescription", "notificationType", "actionById", "actionAt", "message", "originalItemData", "isRead")
        VALUES ($1, $2, $3, 'REJECTION', $4, NOW(), $5, $6, false)
      `, {
        bind: [
          id,
          item.itemNumber, 
          item.shortDescription, 
          reviewerId,
          `${rejectionReason} (${rejectionType === 'ALLOW_EDIT' ? 'Can be recreated' : 'Permanently deleted'})`,
          JSON.stringify({...originalItemData, rejectionType})
        ]
      });

      // Always delete the rejected item from database (regardless of rejection type)
      await sequelize.query(`
        DELETE FROM "ItemMasters" WHERE id = $1
      `, {
        bind: [id]
      });

      const actionText = rejectionType === 'ALLOW_EDIT' ? 'rejected (can be recreated)' : 'rejected and permanently deleted';
      
      console.log(`✅ Item ${actionText}: ${item.shortDescription} (${item.itemNumber})`);
      console.log(`   Rejection reason: ${rejectionReason}`);
      console.log(`   Rejection type: ${rejectionType}`);
      console.log(`   Notification created with original data stored`);

      res.status(200).json({
        success: true,
        message: `Item "${item.shortDescription}" (${item.itemNumber}) was ${actionText}. Reason: ${rejectionReason}`,
        data: {
          deleted: true,
          rejectionType: rejectionType,
          canRecreate: rejectionType === 'ALLOW_EDIT',
          itemDetails: {
            id: item.id,
            itemNumber: item.itemNumber,
            shortDescription: item.shortDescription
          },
          rejectionReason: rejectionReason,
          notificationCreated: true
        }
      });
    }

  } catch (error) {
    console.error('❌ Review item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing item',
      error: error.message
    });
  }
};

// Create new item functionality
exports.createItemMaster = async (req, res) => {
  console.log('🔥 createItemMaster CALLED!');
  try {
    const userId = req.user?.id;
    const itemData = req.body;

    console.log('Create item request:', itemData);    // Generate temporary item number
    const tempItemNumber = await generateTemporaryItemNumber();
    
    // Validate and prepare enum values
    const validCriticalities = ['HIGH', 'MEDIUM', 'LOW', 'NO'];
    const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'];
    const validStockCodes = ['ST1', 'ST2', 'NS3'];
    
    const criticality = validCriticalities.includes(itemData.criticality) ? itemData.criticality : 'MEDIUM';
    const stockItem = itemData.stockItem ? 'Y' : 'N';
    const plannedStock = itemData.plannedStock ? 'Y' : 'N';
    const status = 'PENDING_REVIEW'; // All new items start as pending review
    
    console.log('Enum values:', { criticality, stockItem, plannedStock, status });

    // Prepare the item data for insertion
    const newItem = {
      id: require('uuid').v4(),
      itemNumber: tempItemNumber,
      shortDescription: itemData.shortDescription || '',
      longDescription: itemData.longDescription || itemData.description || '',
      standardDescription: itemData.standardDescription || '',
      manufacturerName: itemData.manufacturerName || '',
      manufacturerPartNumber: itemData.manufacturerPartNumber || '',
      equipmentCategory: itemData.equipmentCategory || 'GENERAL',
      equipmentSubCategory: itemData.equipmentSubCategory || '',
      criticality: criticality,
      uom: itemData.uom || 'EA',
      status: status,
      stockItem: stockItem,
      plannedStock: plannedStock,
      unspscCodeId: itemData.unspscCodeId || null,
      unspscCode: itemData.unspscCode || '',
      supplierName: itemData.supplierName || '',
      contractNumber: itemData.contractNumber || '',
      equipmentTag: itemData.equipmentTag || '',
      serialNumber: itemData.serialNumber || '',
      createdById: userId,
      updatedById: userId
    };

    // Insert the new item
    await sequelize.query(`
      INSERT INTO "ItemMasters" (
        id, "itemNumber", "shortDescription", "longDescription", "standardDescription",
        "manufacturerName", "manufacturerPartNumber", "equipmentCategory", "equipmentSubCategory",
        criticality, uom, status, "stockItem", "plannedStock", "unspscCodeId", "unspscCode",
        "supplierName", "contractNumber", "equipmentTag", "serialNumber",
        "createdById", "updatedById", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW()
      )
    `, {
      bind: [
        newItem.id, newItem.itemNumber, newItem.shortDescription, newItem.longDescription,
        newItem.standardDescription, newItem.manufacturerName, newItem.manufacturerPartNumber,
        newItem.equipmentCategory, newItem.equipmentSubCategory, newItem.criticality,
        newItem.uom, newItem.status, newItem.stockItem, newItem.plannedStock,
        newItem.unspscCodeId, newItem.unspscCode, newItem.supplierName, newItem.contractNumber,
        newItem.equipmentTag, newItem.serialNumber, newItem.createdById, newItem.updatedById
      ]
    });

    console.log(`✅ Item created successfully with temp number: ${tempItemNumber}`);

    res.status(201).json({
      success: true,
      message: 'Item created successfully and submitted for review',
      data: newItem
    });

  } catch (error) {
    console.error('❌ Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// Get all notifications (rejections and approvals)
exports.getNotifications = async (req, res) => {
  console.log('🔔 getNotifications CALLED!');
  try {
    const { page = 1, items: itemsPerPage = 20, onlyUnread = false, type = 'ALL' } = req.query;
    const offset = (page - 1) * itemsPerPage;
    
    let whereClause = '1=1';
    if (onlyUnread === 'true') {
      whereClause = 'n."isRead" = false';
    }
    
    if (type !== 'ALL') {
      whereClause += ` AND n."notificationType" = '${type}'`;
    }
    
    // Get notifications with action user info
    const [notifications] = await sequelize.query(`
      SELECT n.*, 
             u.name as "actionByName", u.email as "actionByEmail"
      FROM "Notifications" n
      LEFT JOIN "Users" u ON n."actionById" = u.id
      WHERE ${whereClause}
      ORDER BY n."actionAt" DESC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `);
    
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Notifications" n
      WHERE ${whereClause}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || 0);
    const unreadCount = await getUnreadNotificationCount();
    
    console.log(`✅ Found ${totalCount} notifications, ${unreadCount} unread`);

    res.status(200).json({
      success: true,
      count: totalCount,
      unreadCount: unreadCount,
      data: notifications,
      pagination: {
        page: parseInt(page),
        items: parseInt(itemsPerPage),
        total: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      },
      message: `${totalCount} rejection notifications found`
    });

  } catch (error) {
    console.error('❌ Get rejection notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rejection notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  console.log('✅ markNotificationAsRead CALLED!');
  try {
    const { id } = req.params;
      await sequelize.query(`
      UPDATE "Notifications" 
      SET "isRead" = true, "updatedAt" = NOW()
      WHERE id = $1
    `, {
      bind: [id]
    });
    
    const unreadCount = await getUnreadNotificationCount();
    
    console.log(`✅ Notification ${id} marked as read`);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  console.log('✅ markAllNotificationsAsRead CALLED!');
  try {    await sequelize.query(`
      UPDATE "Notifications" 
      SET "isRead" = true, "updatedAt" = NOW()
      WHERE "isRead" = false
    `);
    
    console.log(`✅ All notifications marked as read`);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0
    });

  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// Delete a single notification
exports.deleteNotification = async (req, res) => {
  console.log('🗑️ deleteNotification CALLED!');
  try {
    const { id } = req.params;
      // Check if notification exists
    const [notification] = await sequelize.query(`
      SELECT id FROM "Notifications" WHERE id = $1
    `, {
      bind: [id]
    });
    
    if (!notification || notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Delete the notification
    await sequelize.query(`
      DELETE FROM "Notifications" WHERE id = $1
    `, {
      bind: [id]
    });
    
    const unreadCount = await getUnreadNotificationCount();
    
    console.log(`✅ Notification ${id} deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  console.log('🗑️ deleteAllNotifications CALLED!');
  try {
    // Get count before deletion
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "RejectionNotifications"
    `);
    
    const totalCount = parseInt(countResult[0]?.count || 0);
    
    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No notifications to delete',
        deletedCount: 0,
        unreadCount: 0
      });
    }
    
    // Delete all notifications
    await sequelize.query(`
      DELETE FROM "RejectionNotifications"
    `);
    
    console.log(`✅ All ${totalCount} notifications deleted successfully`);

    res.status(200).json({
      success: true,
      message: `All ${totalCount} notifications deleted successfully`,
      deletedCount: totalCount,
      unreadCount: 0
    });

  } catch (error) {
    console.error('❌ Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all notifications',
      error: error.message
    });
  }
};

// Clear read notifications only
exports.clearReadNotifications = async (req, res) => {
  console.log('🧹 clearReadNotifications CALLED!');
  try {
    // Get count of read notifications
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "RejectionNotifications" WHERE "isRead" = true
    `);
    
    const readCount = parseInt(countResult[0]?.count || 0);
    
    if (readCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No read notifications to clear',
        deletedCount: 0
      });
    }
    
    // Delete read notifications
    await sequelize.query(`
      DELETE FROM "RejectionNotifications" WHERE "isRead" = true
    `);
    
    const unreadCount = await getUnreadNotificationCount();
    
    console.log(`✅ ${readCount} read notifications cleared successfully`);

    res.status(200).json({
      success: true,
      message: `${readCount} read notifications cleared successfully`,
      deletedCount: readCount,
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error('❌ Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing read notifications',
      error: error.message
    });
  }
};

// Helper function to get unread notification count
const getUnreadNotificationCount = async () => {
  try {
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Notifications"
      WHERE "isRead" = false
    `);
    return parseInt(countResult[0]?.count || 0);
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Generate temporary item number
const generateTemporaryItemNumber = async () => {
  try {
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    // Find the latest temp number for today
    const [results] = await sequelize.query(`
      SELECT "itemNumber" FROM "ItemMasters" 
      WHERE "itemNumber" LIKE 'TEMP-${dateStr}-%'
      ORDER BY "itemNumber" DESC 
      LIMIT 1
    `);
    
    let sequence = 1;
    if (results && results.length > 0) {
      const lastNumber = results[0].itemNumber;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    const tempNumber = `TEMP-${dateStr}-${sequence.toString().padStart(3, '0')}`;
    console.log(`Generated temporary item number: ${tempNumber}`);
    return tempNumber;
  } catch (error) {
    console.error('Error generating temporary item number:', error);
    return `TEMP-${Date.now()}`;
  }
};

// Helper function to generate final item number
const generateFinalItemNumber = (item) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const category = (item.equipmentCategory || 'ITEM').toUpperCase();
  const subCategory = (item.equipmentSubCategory || '').toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  if (subCategory) {
    return `${category}-${subCategory}-${year}${month}${day}-${random}`;
  } else {
    return `${category}-${year}${month}${day}-${random}`;
  }
};

// Generate temporary item number
const generateTempItemNumber = () => {
  const timestamp = Date.now().toString();
  return `TEMP-${timestamp}`;
};

// Recreate item from rejection notification
exports.recreateFromNotification = async (req, res) => {
  console.log('🔄 recreateFromNotification CALLED!');
  try {
    const { notificationId } = req.params;
    const { userId } = req.body; // The user recreating the item
    
    // Get the notification with original item data
    const [notification] = await sequelize.query(`
      SELECT * FROM "RejectionNotifications" 
      WHERE id = $1
    `, {
      bind: [notificationId]
    });
    
    if (!notification || notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const notificationData = notification[0];
    
    if (!notificationData.originalItemData) {
      return res.status(400).json({
        success: false,
        message: 'No original item data available for recreation'
      });
    }
    
    // Parse the original item data
    const originalData = JSON.parse(notificationData.originalItemData);
    
    // Generate a new temporary item number
    const tempItemNumber = await generateTemporaryItemNumber();
    
    // Create the new item with original data but new ID and number
    const [newItem] = await sequelize.query(`
      INSERT INTO "ItemMasters" (
        id, "itemNumber", "shortDescription", "longDescription", 
        "standardDescription", "manufacturerName", "manufacturerPartNumber",
        "equipmentCategory", "equipmentSubCategory", "unspscCodeId", "unspscCode",
        "uom", "equipmentTag", criticality, "stockItem", "plannedStock", 
        "stockCode", status, "supplierName", "createdById", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
        $13, $14, $15, $16, 'PENDING_REVIEW', $17, $18, NOW(), NOW()
      ) RETURNING *
    `, {
      bind: [
        tempItemNumber,
        originalData.shortDescription,
        originalData.longDescription,
        originalData.standardDescription,
        originalData.manufacturerName,
        originalData.manufacturerPartNumber,
        originalData.equipmentCategory,
        originalData.equipmentSubCategory,
        originalData.unspscCodeId,
        originalData.unspscCode,
        originalData.uom,
        originalData.equipmentTag,
        originalData.criticality,
        originalData.stockItem,
        originalData.plannedStock,
        originalData.stockCode,
        originalData.supplierName,
        userId
      ]
    });
    
    // Mark the notification as read since it's been acted upon
    await sequelize.query(`
      UPDATE "RejectionNotifications" 
      SET "isRead" = true, "updatedAt" = NOW()
      WHERE id = $1
    `, {
      bind: [notificationId]
    });
    
    console.log(`✅ Item recreated successfully from notification: ${tempItemNumber}`);

    res.status(201).json({
      success: true,
      message: 'Item recreated successfully from notification',
      data: {
        id: newItem[0].id,
        itemNumber: tempItemNumber,
        status: 'PENDING_REVIEW'
      }
    });

  } catch (error) {
    console.error('❌ Recreate from notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recreating item from notification',
      error: error.message
    });
  }
};

// Enhanced search functionality for Item Masters
exports.searchItemMasters = async (req, res) => {
  console.log('🔍 Enhanced Item Master Search CALLED');
  try {
    const { searchTerm, searchType, limit = 50 } = req.query;
    
    if (!searchTerm || searchTerm.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    console.log(`🔍 Searching for: "${searchTerm}" with type: ${searchType}`);

    let whereClause = '';
    let searchParams = [];
    
    // Determine search type and build appropriate query
    switch (searchType) {
      case 'number':
        // Search by item number - should return unique result
        whereClause = `i."itemNumber" = $1`;
        searchParams = [searchTerm.trim()];
        break;
        
      case 'description':
        // Search by description - can return multiple results
        whereClause = `(
          i."shortDescription" ILIKE $1 OR 
          i."longDescription" ILIKE $1 OR 
          i."standardDescription" ILIKE $1
        )`;
        searchParams = [`%${searchTerm.trim()}%`];
        break;
        
      case 'manufacturer':
        // Search by manufacturer name
        whereClause = `i."manufacturerName" ILIKE $1`;
        searchParams = [`%${searchTerm.trim()}%`];
        break;
        
      case 'partNumber':
        // Search by manufacturer part number - should return unique result
        whereClause = `i."manufacturerPartNumber" = $1`;
        searchParams = [searchTerm.trim()];
        break;
        
      case 'category':
        // Search by equipment category
        whereClause = `(
          i."equipmentCategory" ILIKE $1 OR 
          i."equipmentSubCategory" ILIKE $1
        )`;
        searchParams = [`%${searchTerm.trim()}%`];
        break;
        
      default:
        // Smart search - search across all fields
        whereClause = `(
          i."itemNumber" ILIKE $1 OR
          i."shortDescription" ILIKE $1 OR 
          i."longDescription" ILIKE $1 OR 
          i."standardDescription" ILIKE $1 OR
          i."manufacturerName" ILIKE $1 OR 
          i."manufacturerPartNumber" ILIKE $1 OR
          i."equipmentCategory" ILIKE $1 OR
          i."equipmentSubCategory" ILIKE $1 OR
          i."equipmentTag" ILIKE $1
        )`;
        searchParams = [`%${searchTerm.trim()}%`];
    }

    // Execute search with enhanced details
    const [searchResults] = await sequelize.query(`
      SELECT 
        i.*,
        c.name as "createdByName", c.email as "createdByEmail",
        r.name as "reviewedByName", r.email as "reviewedByEmail",
        u.name as "updatedByName", u.email as "updatedByEmail",
        -- Stock status calculation
        CASE 
          WHEN i."plannedStock" = 'Y' THEN 'ST2'
          WHEN i."stockItem" = 'Y' THEN 'ST1' 
          ELSE 'NS3'
        END as "stockCode",
        CASE 
          WHEN i."plannedStock" = 'Y' THEN 'Planned Stock - Min/Max levels required'
          WHEN i."stockItem" = 'Y' THEN 'Stock Item - Keep for critical/long lead time'
          ELSE 'Non-Stock - Direct orders/contracts only'
        END as "stockDescription"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" r ON i."reviewedById" = r.id  
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN i."itemNumber" = $${searchParams.length + 1} THEN 1 ELSE 2 END,
        i."updatedAt" DESC
      LIMIT $${searchParams.length + 2}
    `, {
      bind: [...searchParams, searchTerm.trim(), limit]
    });

    console.log(`✅ Search completed - Found ${searchResults.length} results`);

    // Format results with enhanced display information
    const formattedResults = searchResults.map(item => ({
      ...item,
      displayInfo: {
        // Primary identification
        itemNumber: item.itemNumber,
        description: item.shortDescription,
        standardDescription: item.standardDescription,
        
        // Manufacturer details  
        manufacturerName: item.manufacturerName,
        manufacturerPartNumber: item.manufacturerPartNumber,
        
        // Technical specifications
        equipmentCategory: item.equipmentCategory,
        equipmentSubCategory: item.equipmentSubCategory,
        uom: item.uom || 'EA',
        equipmentTag: item.equipmentTag,
        serialNumber: item.serialNumber,
        criticality: item.criticality,
        
        // Stock configuration
        stockCode: item.stockCode,
        stockDescription: item.stockDescription,
        stockItem: item.stockItem,
        plannedStock: item.plannedStock,
        
        // Contract/Supplier info
        contractNumber: item.contractNumber,
        supplierName: item.supplierName,
        
        // Status info
        status: item.status,
        isInterimNumber: item.itemNumber?.startsWith('TEMP-'),
        
        // UNSPSC info
        unspscCode: item.unspscCode,
        
        // Workflow info
        createdBy: item.createdByName,
        reviewedBy: item.reviewedByName,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    }));

    res.status(200).json({
      success: true,
      searchTerm,
      searchType: searchType || 'smart',
      count: searchResults.length,
      isUniqueResult: searchResults.length === 1 && (searchType === 'number' || searchType === 'partNumber'),
      data: formattedResults,
      message: `Found ${searchResults.length} item(s) matching "${searchTerm}"`
    });

  } catch (error) {
    console.error('❌ Enhanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};
