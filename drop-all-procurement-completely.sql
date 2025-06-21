-- Drop all procurement tables completely to ensure clean slate
DROP TABLE IF EXISTS "PurchaseRequisitionItems" CASCADE;
DROP TABLE IF EXISTS "PurchaseRequisitions" CASCADE;
DROP TABLE IF EXISTS "PurchaseOrderItems" CASCADE;
DROP TABLE IF EXISTS "PurchaseOrders" CASCADE;
DROP TABLE IF EXISTS "RfqQuoteItems" CASCADE;
DROP TABLE IF EXISTS "RfqSuppliers" CASCADE;
DROP TABLE IF EXISTS "RfqItems" CASCADE;
DROP TABLE IF EXISTS "RequestForQuotations" CASCADE;
DROP TABLE IF EXISTS "ContractItems" CASCADE;
DROP TABLE IF EXISTS "Contracts" CASCADE;
DROP TABLE IF EXISTS "Suppliers" CASCADE;
DROP TABLE IF EXISTS "ApprovalHistories" CASCADE;
DROP TABLE IF EXISTS "DelegationOfAuthorities" CASCADE;

-- Also drop any ENUM types that might exist
DROP TYPE IF EXISTS "enum_PurchaseRequisitions_status" CASCADE;
DROP TYPE IF EXISTS "enum_PurchaseRequisitionItems_status" CASCADE;
DROP TYPE IF EXISTS "enum_Suppliers_status" CASCADE;
DROP TYPE IF EXISTS "enum_Suppliers_supplierType" CASCADE;
DROP TYPE IF EXISTS "enum_Contracts_status" CASCADE;
DROP TYPE IF EXISTS "enum_PurchaseOrders_status" CASCADE;
DROP TYPE IF EXISTS "enum_RequestForQuotations_status" CASCADE;
DROP TYPE IF EXISTS "enum_RfqSuppliers_status" CASCADE;
DROP TYPE IF EXISTS "enum_ApprovalHistories_action" CASCADE;
DROP TYPE IF EXISTS "enum_DelegationOfAuthorities_status" CASCADE;
