# Inventory Management Module

## Overview
The Inventory Management module is designed to manage stock levels for items in the ERP system. It includes functionality for:

1. Setting up stock levels for items marked as "Planned stock Item"
2. Managing inventory with comprehensive form fields
3. Creating reorder requests based on minimum/maximum levels
4. Workflow for reordering that creates IRCs (Inventory Request Confirmations)
5. Approval process that converts IRCs to Purchase Requisitions

## Features

### Inventory Form
- Inventory number and short/long descriptions
- Critical business fields (criticality, UNSPSC code, stock details)
- Manufacturer information
- Physical balance, UoM, and pricing information
- Condition status (A-New through E-Scrap)
- Min/Max stock levels
- Location details (storage, bin, warehouse)

### Reorder Process
1. **Scan for Low Stock**: Automatically identifies items below minimum stock levels
2. **Create IRC**: Generates Inventory Request Confirmations (IRCs)
3. **Approval Workflow**: IRCs get approved and converted to Purchase Requisitions
4. **Contract Handling**: Items with existing contracts can be automatically converted to POs
5. **Buyer Routing**: Non-contract items get routed to buyers for processing

### Search Capabilities
- Advanced search functionality for inventory items
- Filter by various criteria (description, warehouse, criticality, etc.)
- Quickly identify items that need attention (below minimum, zero balance, etc.)

## Technical Architecture

### Frontend Components
- **InventoryForm**: Manages creation and editing of inventory items
- **InventoryReorder**: Handles the reorder process from scanning to IRC creation
- **InventorySearch**: Provides advanced search capabilities
- **InventoryIndex**: Main component with overview of inventory

### Backend Services
- **reorderRequestController.js**: Handles all reorder-related functionality
- **inventoryController.js**: Manages inventory CRUD operations
- **inventoryModel.js**: Defines the data structure for inventory items
- **reorderRequestModel.js**: Defines the data structure for reorder requests

### API Endpoints
- **GET /api/inventory**: Get inventory items with advanced filtering
- **POST /api/inventory**: Create new inventory item
- **GET /api/inventory/:id**: Get specific inventory item
- **PUT /api/inventory/:id**: Update inventory item
- **POST /api/inventory/reorder-request/scan**: Scan for items below minimum level
- **POST /api/inventory/reorder-request**: Create reorder request
- **PUT /api/inventory/reorder-request/:id/submit**: Submit reorder request for approval
- **PUT /api/inventory/reorder-request/:id/approve**: Approve reorder request and create PR

## Usage Guidelines

### Setting Up Inventory
1. Navigate to Inventory > Create
2. Fill in all required fields, paying special attention to:
   - Description (maximum 44 characters for short description)
   - Criticality (High, Medium, Non-critical)
   - Min/Max levels for automated reordering
   - Location information for proper storage

### Reordering Process
1. Navigate to Inventory > Reorder
2. Select a warehouse to scan for low stock items
3. Review the items and adjust quantities if needed
4. Submit the reorder request to create an IRC
5. Approval authority will review and approve the IRC
6. Once approved, the system will:
   - Create a Purchase Requisition
   - Automatically create POs for contract items
   - Route non-contract items to buyers

### Searching Inventory
1. Navigate to Inventory > Search
2. Use the advanced filters to find specific items
3. Export results or take actions on individual items

## Future Enhancements
1. Integration with barcode/RFID scanning for physical inventory
2. Automated cycle counting functionality
3. Demand forecasting based on historical usage
4. Enhanced reporting and analytics
5. Mobile app support for warehouse operations
