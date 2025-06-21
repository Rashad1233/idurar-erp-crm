// utility functions to validate supplier IDs and help debug supplier selection issues

/**
 * Validates a supplier object to ensure it has a valid ID
 * @param {Object} supplier - The supplier object to validate
 * @returns {Object} - A validation result object with isValid flag and normalized supplier
 */
export const validateSupplier = (supplier) => {
  if (!supplier) {
    return { 
      isValid: false, 
      normalizedSupplier: null, 
      error: 'Supplier is null or undefined' 
    };
  }

  const existingId = supplier._id || supplier.id;
  
  if (!existingId) {
    // Generate a temporary ID for suppliers without IDs
    const nameSlug = supplier.name ? 
      supplier.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 15) : '';
    const tempId = `temp-${nameSlug}-${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      isValid: false,
      error: 'Supplier missing ID',
      normalizedSupplier: {
        ...supplier,
        _id: tempId,
        id: tempId,
        name: supplier.name || 'Unnamed Supplier',
        email: supplier.email || 'No email'
      }
    };
  }
  
  // Has a valid ID, just normalize the object
  return {
    isValid: true,
    normalizedSupplier: {
      ...supplier,
      _id: existingId,
      id: existingId,
      name: supplier.name || 'Unnamed Supplier',
      email: supplier.email || 'No email'
    },
    error: null
  };
};

/**
 * Processes an array of suppliers and ensures they all have valid, unique IDs
 * @param {Array} suppliers - Array of supplier objects
 * @returns {Object} - Object containing normalized suppliers and validation info
 */
export const normalizeSuppliers = (suppliers) => {
  if (!Array.isArray(suppliers)) {
    return { 
      normalizedSuppliers: [],
      isValid: false,
      hasDuplicates: false,
      hasMissingIds: false,
      errors: ['Suppliers is not an array']
    };
  }

  const idMap = new Map();
  const errors = [];
  let hasMissingIds = false;
  let hasDuplicates = false;

  const normalizedSuppliers = suppliers.map((supplier, index) => {
    if (!supplier) {
      const error = `Supplier at index ${index} is null or undefined`;
      errors.push(error);
      console.warn(error);
      
      // Create a placeholder supplier
      const placeholderId = `missing-${index}-${Math.random().toString(36).substring(2, 10)}`;
      hasMissingIds = true;
      
      return {
        _id: placeholderId,
        id: placeholderId,
        name: `Missing Supplier ${index}`,
        email: 'no-email',
        __isPlaceholder: true
      };
    }
    
    const { isValid, normalizedSupplier, error } = validateSupplier(supplier);
    
    if (!isValid) {
      hasMissingIds = true;
      errors.push(`Supplier at index ${index} has an issue: ${error}`);
    }
    
    const id = normalizedSupplier._id;
    
    // Check for duplicates
    if (idMap.has(id)) {
      hasDuplicates = true;
      const duplicate = idMap.get(id);
      const error = `Duplicate ID found: ${id} for supplier ${normalizedSupplier.name} and ${duplicate}`;
      errors.push(error);
      console.warn(error);
      
      // Generate a new unique ID for this duplicate
      const newId = `${id}-dup-${Math.random().toString(36).substring(2, 10)}`;
      normalizedSupplier._id = newId;
      normalizedSupplier.id = newId;
      
      // Mark this as a fixed duplicate for debugging
      normalizedSupplier.__duplicateFixed = true;
      normalizedSupplier.__originalId = id;
    }
    
    idMap.set(normalizedSupplier._id, normalizedSupplier.name);
    
    return normalizedSupplier;
  });

  return {
    normalizedSuppliers,
    isValid: !hasMissingIds && !hasDuplicates,
    hasDuplicates,
    hasMissingIds,
    errors
  };
};

/**
 * Prepares suppliers for use in a Transfer component
 * @param {Array} suppliers - Array of supplier objects
 * @returns {Array} - Array of objects ready for Transfer component dataSource
 */
export const prepareTransferDataSource = (suppliers) => {
  const { normalizedSuppliers } = normalizeSuppliers(suppliers);
  
  return normalizedSuppliers.map((supplier, index) => {
    // Create a safe key - ensure it's always a string and never empty
    const key = supplier._id || supplier.id || `supplier-${index}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Add visual indicators for placeholder or fixed suppliers
    let description = supplier.email;
    if (supplier.__isPlaceholder) {
      description = 'PLACEHOLDER SUPPLIER';
    } else if (supplier.__duplicateFixed) {
      description = `${description} (ID fixed, was duplicate of ${supplier.__originalId})`;
    }
    
    // Return a properly formatted object for Transfer
    return {
      key,
      title: supplier.name,
      description,
      originalSupplier: supplier,
      disabled: supplier.__isPlaceholder // Disable placeholder suppliers
    };
  });
};
