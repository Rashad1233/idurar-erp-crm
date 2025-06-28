// Export a function that takes the models object and sets up associations
module.exports = (models) => {
  const { 
    User, 
    ItemMaster, 
    Inventory, 
    StorageLocation, 
    BinLocation, 
    Transaction, 
    TransactionItem, 
    ReorderRequest, 
    ReorderRequestItem,
    UnspscCode,
    UserUnspscFavorite,
    UserUnspscHierarchy,
    PurchaseRequisition,
    PurchaseRequisitionItem,
    RequestForQuotation,
    RfqItem,
    RfqSupplier,
    RfqQuoteItem,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    Contract,
    ContractItem,
    ApprovalHistory,
    DelegationOfAuthority,
    Customer,
    SalesOrder,
    SalesOrderItem
  } = models;

  // Helper function to safely set up associations
  const safeAssociation = (model1, method, model2, options) => {
    if (model1 && model2 && typeof model1[method] === 'function') {
      model1[method](model2, options);
    } else {
      console.warn(`Skipping association: ${model1?.name || 'undefined'}.${method}(${model2?.name || 'undefined'})`);
    }
  };

// User associations
  safeAssociation(User, 'hasMany', ItemMaster, { foreignKey: 'createdById', as: 'createdItems' });
  safeAssociation(User, 'hasMany', ItemMaster, { foreignKey: 'reviewedById', as: 'reviewedItems' });
  safeAssociation(User, 'hasMany', ItemMaster, { foreignKey: 'approvedById', as: 'approvedItems' });
  safeAssociation(User, 'hasMany', Inventory, { foreignKey: 'lastUpdatedById', as: 'updatedInventories' });
  safeAssociation(User, 'hasMany', StorageLocation, { foreignKey: 'createdById', as: 'createdStorageLocations' });
  safeAssociation(User, 'hasMany', BinLocation, { foreignKey: 'createdById', as: 'createdBinLocations' });
  safeAssociation(User, 'hasMany', Transaction, { foreignKey: 'createdById', as: 'createdTransactions' });
  safeAssociation(User, 'hasMany', Transaction, { foreignKey: 'completedById', as: 'completedTransactions' });
  safeAssociation(User, 'hasMany', ReorderRequest, { foreignKey: 'createdById', as: 'createdReorderRequests' });
  safeAssociation(User, 'hasMany', ReorderRequest, { foreignKey: 'approvedById', as: 'approvedReorderRequests' });
  // ItemMaster associations
  safeAssociation(ItemMaster, 'belongsTo', User, { foreignKey: 'createdById', as: 'createdBy' });
  safeAssociation(ItemMaster, 'belongsTo', User, { foreignKey: 'reviewedById', as: 'reviewedBy' });
  safeAssociation(ItemMaster, 'belongsTo', User, { foreignKey: 'approvedById', as: 'approvedBy' });
  safeAssociation(ItemMaster, 'hasMany', Inventory, { foreignKey: 'itemMasterId', as: 'inventories' });
  safeAssociation(ItemMaster, 'belongsTo', UnspscCode, { foreignKey: 'unspscCodeId', as: 'unspsc' });
  
  // Inventory associations
  safeAssociation(Inventory, 'belongsTo', ItemMaster, { foreignKey: 'itemMasterId', as: 'itemMaster' });
  safeAssociation(Inventory, 'belongsTo', StorageLocation, { foreignKey: 'storageLocationId', as: 'storageLocation' });
  safeAssociation(Inventory, 'belongsTo', BinLocation, { foreignKey: 'binLocationId', as: 'binLocation' });  safeAssociation(Inventory, 'belongsTo', User, { foreignKey: 'lastUpdatedById', as: 'lastUpdatedBy' });
  safeAssociation(Inventory, 'hasMany', TransactionItem, { foreignKey: 'inventoryId', as: 'transactionItems' });
  safeAssociation(Inventory, 'hasMany', ReorderRequestItem, { foreignKey: 'inventoryId', as: 'reorderItems' });  // StorageLocation associations
  safeAssociation(StorageLocation, 'belongsTo', User, { foreignKey: 'createdById', as: 'storageCreatedBy' });
  safeAssociation(StorageLocation, 'hasMany', BinLocation, { foreignKey: 'storageLocationId', as: 'bins' });
  safeAssociation(StorageLocation, 'hasMany', Inventory, { foreignKey: 'storageLocationId', as: 'inventories' });
  safeAssociation(StorageLocation, 'hasMany', TransactionItem, { foreignKey: 'sourceLocationId', as: 'sourceTransactions' });
  safeAssociation(StorageLocation, 'hasMany', TransactionItem, { foreignKey: 'destinationLocationId', as: 'destinationTransactions' });
  safeAssociation(StorageLocation, 'hasMany', ReorderRequest, { foreignKey: 'storageLocationId', as: 'reorderRequests' });  // BinLocation associations
  safeAssociation(BinLocation, 'belongsTo', StorageLocation, { foreignKey: 'storageLocationId', as: 'parentStorageLocation' });
  safeAssociation(BinLocation, 'belongsTo', User, { foreignKey: 'createdById', as: 'binCreatedBy' });
  safeAssociation(BinLocation, 'hasMany', TransactionItem, { foreignKey: 'sourceBinId', as: 'sourceTransactions' });
  safeAssociation(BinLocation, 'hasMany', TransactionItem, { foreignKey: 'destinationBinId', as: 'destinationTransactions' });

  // Transaction associations
  Transaction.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
  Transaction.belongsTo(User, { foreignKey: 'completedById', as: 'completedBy' });
  Transaction.hasMany(TransactionItem, { foreignKey: 'transactionId', as: 'items' });

  // TransactionItem associations
  TransactionItem.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });
  TransactionItem.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventory' });
  TransactionItem.belongsTo(StorageLocation, { foreignKey: 'sourceLocationId', as: 'sourceLocation' });
  TransactionItem.belongsTo(BinLocation, { foreignKey: 'sourceBinId', as: 'sourceBin' });
  TransactionItem.belongsTo(StorageLocation, { foreignKey: 'destinationLocationId', as: 'destinationLocation' });
  TransactionItem.belongsTo(BinLocation, { foreignKey: 'destinationBinId', as: 'destinationBin' });

  // ReorderRequest associations
  ReorderRequest.belongsTo(StorageLocation, { foreignKey: 'storageLocationId', as: 'storageLocation' });
  ReorderRequest.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
  ReorderRequest.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
  ReorderRequest.hasMany(ReorderRequestItem, { foreignKey: 'reorderRequestId', as: 'items' });

  // ReorderRequestItem associations  ReorderRequestItem.belongsTo(ReorderRequest, { foreignKey: 'reorderRequestId', as: 'reorderRequest' });
  ReorderRequestItem.belongsTo(Inventory, { foreignKey: 'inventoryId', as: 'inventory' });    // UserUnspscFavorite associations
  UserUnspscFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(UserUnspscFavorite, { foreignKey: 'userId', as: 'unspscFavorites' });
    // UserUnspscHierarchy associations
  UserUnspscHierarchy.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(UserUnspscHierarchy, { foreignKey: 'userId', as: 'unspscHierarchy' });

  // PurchaseRequisition and ApprovalHistory associations
  safeAssociation(PurchaseRequisition, 'hasMany', ApprovalHistory, { 
    foreignKey: 'referenceId', 
    scope: { referenceType: 'PurchaseRequisition' },
    as: 'approvalHistory' 
  });
  safeAssociation(ApprovalHistory, 'belongsTo', PurchaseRequisition, { 
    foreignKey: 'referenceId', 
    as: 'purchaseRequisition',
    constraints: false 
  });

  // Call individual model associate functions for procurement models
  if (PurchaseRequisition && typeof PurchaseRequisition.associate === 'function') {
    PurchaseRequisition.associate(models);
  }
  if (PurchaseRequisitionItem && typeof PurchaseRequisitionItem.associate === 'function') {
    PurchaseRequisitionItem.associate(models);
  }
  if (RequestForQuotation && typeof RequestForQuotation.associate === 'function') {
    RequestForQuotation.associate(models);
  }
  if (RfqItem && typeof RfqItem.associate === 'function') {
    RfqItem.associate(models);
  }
  if (RfqSupplier && typeof RfqSupplier.associate === 'function') {
    RfqSupplier.associate(models);
  }
  if (RfqQuoteItem && typeof RfqQuoteItem.associate === 'function') {
    RfqQuoteItem.associate(models);
  }
  if (Supplier && typeof Supplier.associate === 'function') {
    Supplier.associate(models);
  }
  if (PurchaseOrder && typeof PurchaseOrder.associate === 'function') {
    PurchaseOrder.associate(models);
  }
  if (PurchaseOrderItem && typeof PurchaseOrderItem.associate === 'function') {
    PurchaseOrderItem.associate(models);
  }
  if (Contract && typeof Contract.associate === 'function') {
    Contract.associate(models);
  }
  if (ContractItem && typeof ContractItem.associate === 'function') {
    ContractItem.associate(models);
  }
  if (ApprovalHistory && typeof ApprovalHistory.associate === 'function') {
    ApprovalHistory.associate(models);
  }
  if (DelegationOfAuthority && typeof DelegationOfAuthority.associate === 'function') {
    DelegationOfAuthority.associate(models);
  }
  if (models.Notification && typeof models.Notification.associate === 'function') {
    models.Notification.associate(models);
  }

  // Call sales model associate functions
  if (Customer && typeof Customer.associate === 'function') {
    Customer.associate(models);
  }
  if (SalesOrder && typeof SalesOrder.associate === 'function') {
    SalesOrder.associate(models);
  }
  if (SalesOrderItem && typeof SalesOrderItem.associate === 'function') {
    SalesOrderItem.associate(models);
  }
};
