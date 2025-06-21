# PostgreSQL Database Tables for Item Master Management

## Overview
The ERP system uses the following PostgreSQL tables for Item Master and related inventory management:

## Core Item Master Tables

### 1. **ItemMasters** Table
**Purpose**: Main table storing all item master data
**Fields**:
- `id` (UUID, Primary Key)
- `itemNumber` (STRING, Unique) - Auto-generated item number
- `shortDescription` (STRING, 100 chars) - Brief description (AI-generated)
- `longDescription` (TEXT) - Detailed technical description (AI-generated)
- `standardDescription` (STRING) - Standard format description (AI-generated)
- `manufacturerName` (STRING) - Manufacturer name (AI-suggested)
- `manufacturerPartNumber` (STRING) - Part number (AI-suggested)
- `equipmentCategory` (STRING) - Category (AI-classified)
- `equipmentSubCategory` (STRING) - Subcategory (AI-suggested)
- `unspscCodeId` (UUID, FK to UnspscCodes) - UNSPSC reference
- `unspscCode` (STRING, 8 chars) - UNSPSC code (AI-generated)
- `uom` (STRING) - Unit of measure (AI-suggested)
- `equipmentTag` (STRING) - Equipment tag
- `serialNumber` (ENUM: Y/N) - Serial number tracking
- `criticality` (ENUM: HIGH/MEDIUM/LOW/NO) - Criticality level (AI-assessed)
- `stockItem` (ENUM: Y/N) - Stock item flag (AI-suggested)
- `plannedStock` (ENUM: Y/N) - Planned stock flag (AI-suggested)
- `stockCode` (ENUM: ST1/ST2/NS3) - Auto-calculated stock code
- `status` (ENUM: DRAFT/PENDING_REVIEW/APPROVED/REJECTED) - Approval status
- `contractNumber` (STRING) - Contract reference
- `supplierName` (STRING) - Supplier name
- `createdById` (UUID, FK to Users) - Creator
- `reviewedById` (UUID, FK to Users) - Reviewer
- `approvedById` (UUID, FK to Users) - Approver
- `updatedById` (UUID, FK to Users) - Last updater
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### 2. **UnspscCodes** Table
**Purpose**: UNSPSC (United Nations Standard Products and Services Code) classification
**Fields**:
- `id` (UUID, Primary Key)
- `code` (STRING, 8 chars, Unique) - UNSPSC code
- `segment` (STRING, 2 chars) - Segment code
- `family` (STRING, 2 chars) - Family code
- `class` (STRING, 2 chars) - Class code
- `commodity` (STRING, 2 chars) - Commodity code
- `title` (STRING) - UNSPSC title
- `definition` (TEXT) - UNSPSC definition
- `level` (ENUM: SEGMENT/FAMILY/CLASS/COMMODITY) - Classification level
- `isActive` (BOOLEAN) - Active status
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Inventory Management Tables

### 3. **Inventories** Table
**Purpose**: Actual inventory records for stock items
**Fields**:
- `id` (UUID, Primary Key)
- `inventoryNumber` (STRING, Unique) - Inventory number
- `physicalBalance` (DECIMAL) - Current stock quantity
- `unitPrice` (DECIMAL) - Unit price
- `linePrice` (DECIMAL) - Total line value
- `condition` (ENUM: A/B/C/D/E) - Item condition
- `minimumLevel` (DECIMAL) - Minimum stock level
- `maximumLevel` (DECIMAL) - Maximum stock level
- `binLocationText` (STRING) - Bin location description
- `warehouse` (STRING) - Warehouse identifier
- `binLocationId` (UUID, FK to BinLocations) - Bin location reference
- `itemMasterId` (UUID, FK to ItemMasters) - Item master reference
- `storageLocationId` (UUID, FK to StorageLocations) - Storage location
- Related timestamps and user references

### 4. **StorageLocations** Table
**Purpose**: Physical storage locations/warehouses
**Fields**:
- `id` (UUID, Primary Key)
- `locationCode` (STRING, Unique) - Location code
- `locationName` (STRING) - Location name
- `locationType` (ENUM) - Type of location
- `address` (TEXT) - Physical address
- `isActive` (BOOLEAN) - Active status
- `capacity` (INTEGER) - Storage capacity
- `currentUtilization` (INTEGER) - Current usage
- User and timestamp fields

### 5. **BinLocations** Table
**Purpose**: Specific bin locations within storage locations
**Fields**:
- `id` (UUID, Primary Key)
- `binCode` (STRING, Unique) - Bin code
- `binName` (STRING) - Bin name
- `storageLocationId` (UUID, FK to StorageLocations) - Parent storage location
- `binType` (ENUM) - Type of bin
- `capacity` (INTEGER) - Bin capacity
- `currentStock` (INTEGER) - Current stock in bin
- `isActive` (BOOLEAN) - Active status
- User and timestamp fields

## Supporting Tables

### 6. **Users** Table
**Purpose**: User management for audit trails
**Fields**:
- `id` (UUID, Primary Key)
- `name` (STRING) - User name
- `email` (STRING, Unique) - Email address
- `role` (STRING) - User role
- Other user management fields

## AI Integration

### How AI Populates the Data:
1. **AI analyzes short description** → Generates all item details automatically
2. **UNSPSC Classification** → AI suggests appropriate 8-digit UNSPSC codes
3. **Technical Specifications** → AI creates detailed technical descriptions
4. **Stock Configuration** → AI suggests stock item flags and criticality
5. **Manufacturer Data** → AI suggests manufacturer names and part numbers

### Database Relationships:
- `ItemMasters.unspscCodeId` → `UnspscCodes.id`
- `ItemMasters.createdById` → `Users.id`
- `Inventories.itemMasterId` → `ItemMasters.id`
- `Inventories.storageLocationId` → `StorageLocations.id`
- `Inventories.binLocationId` → `BinLocations.id`
- `BinLocations.storageLocationId` → `StorageLocations.id`

### Auto-Generated Fields:
- **Item Number**: Auto-generated with category prefix
- **Stock Code**: Auto-calculated based on stock/planned stock flags:
  - `ST1`: Stock item, not planned
  - `ST2`: Stock item, planned
  - `NS3`: Non-stock item

## Usage Workflow:
1. User enters short description
2. AI generates all other fields automatically
3. User reviews and adjusts as needed
4. Item saved to `ItemMasters` table
5. If stock item, inventory record created in `Inventories` table
6. Physical location assigned via `StorageLocations` and `BinLocations`

This design ensures full AI automation while maintaining data integrity and audit trails.
