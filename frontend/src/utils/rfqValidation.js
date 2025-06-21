// This module adds more validation functions for Request For Quotation (RFQ) components

/**
 * Validates RFQ items to ensure they have valid IDs and required fields
 * @param {Array} items - Array of item objects to validate
 * @returns {Object} - Validation results with normalized items
 */
export const validateRfqItems = (items) => {
  if (!Array.isArray(items)) {
    return {
      normalizedItems: [],
      isValid: false,
      errors: ['Items is not an array']
    };
  }

  const errors = [];
  const normalizedItems = items.map((item, index) => {
    if (!item) {
      errors.push(`Item at index ${index} is null or undefined`);
      return null;
    }

    // Create a normalized item with fallbacks for required fields
    const normalizedItem = {
      ...item,
      _id: item._id || item.id || `item-${index}-${Math.random().toString(36).substring(2, 10)}`,
      id: item._id || item.id || `item-${index}-${Math.random().toString(36).substring(2, 10)}`,
      itemName: item.itemName || `Item ${index + 1}`,
      description: item.description || '',
      quantity: parseFloat(item.quantity) || 1,
      uom: item.uom || 'each'
    };

    // Validate required fields
    if (!normalizedItem.itemName) {
      errors.push(`Item at index ${index} is missing a name`);
    }

    if (isNaN(normalizedItem.quantity) || normalizedItem.quantity <= 0) {
      errors.push(`Item at index ${index} has an invalid quantity: ${item.quantity}`);
      normalizedItem.quantity = 1; // Fallback to a valid quantity
    }

    return normalizedItem;
  }).filter(Boolean); // Remove null items

  return {
    normalizedItems,
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates an RFQ form submission data to ensure all required fields are present
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation results with any needed fixes
 */
export const validateRfqFormData = (formData) => {
  const errors = [];
  const warnings = [];
  let isValid = true;

  // Create a copy to avoid mutating the original
  const normalizedFormData = { ...formData };
  // Required fields check for description (not title - title doesn't exist in schema)
  if (!normalizedFormData.description) {
    warnings.push('Description is missing');
    normalizedFormData.description = `RFQ-${new Date().toISOString().substring(0, 10)}`;
  }

  // Remove any non-existent fields that might have been passed
  delete normalizedFormData.title;
  delete normalizedFormData.bidOpeningDate;
  delete normalizedFormData.bidClosingDate;

  // Ensure dueDate is set (required by backend)
  if (!normalizedFormData.dueDate) {
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    normalizedFormData.dueDate = sevenDaysLater.toISOString().substring(0, 10);
  }

  // Validate suppliers
  if (!normalizedFormData.suppliers || !Array.isArray(normalizedFormData.suppliers) || normalizedFormData.suppliers.length === 0) {
    errors.push('At least one supplier must be selected');
    isValid = false;
  } else {
    // Filter out invalid supplier IDs
    const validSuppliers = normalizedFormData.suppliers.filter(id => id && typeof id === 'string' && id.trim() !== '');
    if (validSuppliers.length === 0) {
      errors.push('All selected supplier IDs are invalid');
      isValid = false;
    } else if (validSuppliers.length !== normalizedFormData.suppliers.length) {
      warnings.push(`${normalizedFormData.suppliers.length - validSuppliers.length} invalid supplier IDs were removed`);
      normalizedFormData.suppliers = validSuppliers;
    }
  }

  // Validate items
  if (!normalizedFormData.items || !Array.isArray(normalizedFormData.items) || normalizedFormData.items.length === 0) {
    errors.push('At least one item must be selected');
    isValid = false;
  } else {
    // Check items have required fields
    let hasInvalidItems = false;
    normalizedFormData.items.forEach((item, index) => {
      if (!item.itemName) {
        hasInvalidItems = true;
        warnings.push(`Item at index ${index} is missing a name`);
      }
      
      if (!item.quantity || isNaN(parseFloat(item.quantity)) || parseFloat(item.quantity) <= 0) {
        hasInvalidItems = true;
        warnings.push(`Item at index ${index} has an invalid quantity`);
      }
    });
    
    if (hasInvalidItems) {
      // Instead of rejecting, we'll validate and normalize the items
      const { normalizedItems, isValid: itemsValid } = validateRfqItems(normalizedFormData.items);
      normalizedFormData.items = normalizedItems;
      
      if (!itemsValid) {
        warnings.push('Some items had issues and were fixed automatically');
      }
    }
  }

  return {
    normalizedFormData,
    isValid,
    errors,
    warnings
  };
};
