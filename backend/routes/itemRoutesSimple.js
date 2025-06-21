const express = require('express');
const router = express.Router();
const { sequelize } = require('../models/sequelize');
const { v4: uuidv4 } = require('uuid');

// Get all item masters
router.get('/item', async (req, res) => {
  try {
    console.log('Fetching all item masters...');
    
    const query = `
      SELECT *
      FROM "ItemMasters"
      ORDER BY "createdAt" DESC
      LIMIT 100;
    `;
    
    const items = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`Retrieved ${items.length} item masters`);
    
    return res.status(200).json({
      success: true,
      result: items,
      message: 'Item masters retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching item masters:', error);
    return res.status(500).json({
      success: false,
      result: [],
      message: 'Failed to fetch item masters',
      error: error.message
    });
  }
});

// Get a single item master by ID
router.get('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching item master with ID: ${id}`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Item ID is required'
      });
    }
    
    const query = `
      SELECT *
      FROM "ItemMasters"
      WHERE "id" = :id
      LIMIT 1;
    `;
    
    const items = await sequelize.query(query, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });
    
    if (!items || items.length === 0) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Item not found'
      });
    }
    
    console.log(`Successfully retrieved item with ID: ${id}`);
    
    return res.status(200).json({
      success: true,
      result: items[0],
      message: 'Item retrieved successfully'
    });
  } catch (error) {
    console.error(`Error fetching item master with ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Failed to fetch item',
      error: error.message
    });
  }
});

// Update an item master
router.put('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`Updating item master with ID: ${id}`);
    console.log('Update data:', updates);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    // Remove any fields that shouldn't be updated
    delete updates.id;
    delete updates.createdAt;
    delete updates.created_at;
    delete updates.itemNumber; // Item number should not be changed
    
    // Update the updatedAt and updated_at timestamps
    updates.updatedAt = new Date();
    updates.updated_at = new Date();
    
    // Convert keys and values to arrays for SQL query building
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    
    // Build SET clause for the SQL query
    const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE "ItemMasters"
      SET ${setClause}
      WHERE "id" = $${keys.length + 1}
      RETURNING *;
    `;
    
    // Add the id as the last parameter
    values.push(id);
    
    const result = await sequelize.query(query, {
      bind: values,
      type: sequelize.QueryTypes.UPDATE
    });
    
    if (!result || !result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or update failed'
      });
    }
    
    console.log(`Successfully updated item with ID: ${id}`);
    
    return res.status(200).json({
      success: true,
      result: result[0][0],
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error(`Error updating item master with ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
});

// Delete an item master
router.delete('/item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting item master with ID: ${id}`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }
    
    const query = `
      DELETE FROM "ItemMasters"
      WHERE "id" = $1
      RETURNING *;
    `;
    
    const result = await sequelize.query(query, {
      bind: [id],
      type: sequelize.QueryTypes.DELETE
    });
    
    if (!result || !result[0] || result[0].length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or delete failed'
      });
    }
    
    console.log(`Successfully deleted item with ID: ${id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting item master with ID ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
});

module.exports = router;
