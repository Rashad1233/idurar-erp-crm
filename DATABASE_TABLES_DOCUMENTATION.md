# PostgreSQL Database Tables for ERP Item Master Management

## Core Item Master Tables

### 1. `item_masters` (Main Item Master Table)
**Purpose**: Central repository for all item master data
**Key Fields**:
- `id` (Primary Key) - Unique identifier
- `item_number` - Unique item number (auto-generated)
- `short_description` - Brief item description (max 44 chars)
- `long_description` - Detailed technical description
- `standard_description` - NOUN, MODIFIER format description
- `manufacturer_name` - Manufacturer information
- `manufacturer_part_number` - Manufacturer's part number
- `equipment_category` - Primary classification
- `equipment_sub_category` - Secondary classification
- `unit_of_measure` (UOM) - Unit of measurement
- `equipment_tag` - Optional equipment tag
- `serial_number` - Serial number if applicable
- `criticality` - Criticality level (critical/important/normal/low)
- `stock_item` - Boolean: Is this a stock item?
- `planned_stock` - Boolean: Should stock be planned?
- `stock_code` - Stock classification code
- `status` - Item status (active/inactive/obsolete)
- `unspsc_code` - 8-digit UNSPSC classification code
- `contract_number` - Associated contract number
- `supplier_name` - Primary supplier
- `created_by_id` - Foreign key to users table
- `last_updated_by_id` - Foreign key to users table
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 2. `unspsc_codes` (UNSPSC Classification Table)
**Purpose**: Standard classification codes for procurement
**Key Fields**:
- `id` (Primary Key)
- `code` - 8-digit UNSPSC code
- `title` - UNSPSC code title
- `description` - Detailed description
- `level` - Classification level (1-4)
- `parent_code` - Parent classification code
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Inventory Management Tables

### 3. `inventories` (Inventory Records Table)
**Purpose**: Track inventory levels and locations for each item
**Key Fields**:
- `id` (Primary Key)
- `item_master_id` - Foreign key to item_masters
- `warehouse_id` - Foreign key to warehouses
- `storage_location_id` - Foreign key to storage_locations
- `bin_location_id` - Foreign key to bin_locations
- `quantity_on_hand` - Current stock quantity
- `quantity_allocated` - Allocated quantity
- `quantity_available` - Available quantity (on_hand - allocated)
- `min_stock_level` - Minimum stock level
- `max_stock_level` - Maximum stock level
- `reorder_point` - Reorder trigger point
- `reorder_quantity` - Standard reorder quantity
- `last_updated_by_id` - Foreign key to users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Location Management Tables

### 4. `warehouses` (Warehouse Master Table)
**Purpose**: Define warehouse locations
**Key Fields**:
- `id` (Primary Key)
- `warehouse_code` - Unique warehouse code
- `warehouse_name` - Warehouse name
- `address` - Physical address
- `manager_id` - Foreign key to users (warehouse manager)
- `status` - Warehouse status (active/inactive)
- `created_by_id` - Foreign key to users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 5. `storage_locations` (Storage Location Table)
**Purpose**: Define storage areas within warehouses
**Key Fields**:
- `id` (Primary Key)
- `warehouse_id` - Foreign key to warehouses
- `location_code` - Unique location code
- `location_name` - Location name/description
- `location_type` - Type (zone/aisle/rack/shelf)
- `capacity` - Storage capacity
- `created_by_id` - Foreign key to users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 6. `bin_locations` (Bin Location Table)
**Purpose**: Define specific bin locations within storage areas
**Key Fields**:
- `id` (Primary Key)
- `storage_location_id` - Foreign key to storage_locations
- `bin_code` - Unique bin code
- `bin_name` - Bin name/description
- `bin_type` - Type (shelf/bin/rack)
- `capacity` - Bin capacity
- `created_by_id` - Foreign key to users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Transaction Tables

### 7. `transaction_items` (Inventory Transaction Table)
**Purpose**: Record all inventory movements and transactions
**Key Fields**:
- `id` (Primary Key)
- `inventory_id` - Foreign key to inventories
- `transaction_type` - Type (receipt/issue/transfer/adjustment)
- `transaction_date` - Transaction date
- `quantity` - Transaction quantity (+ for receipts, - for issues)
- `source_location_id` - Source location (for transfers)
- `destination_location_id` - Destination location (for transfers)
- `reference_number` - Reference document number
- `user_id` - User who performed transaction
- `comments` - Transaction comments
- `created_at` - Creation timestamp

### 8. `reorder_requests` (Reorder Request Table)
**Purpose**: Track reorder requests and purchase requisitions
**Key Fields**:
- `id` (Primary Key)
- `item_master_id` - Foreign key to item_masters
- `storage_location_id` - Foreign key to storage_locations
- `requested_quantity` - Requested quantity
- `urgency` - Request urgency (urgent/normal/low)
- `status` - Request status (pending/approved/ordered/received)
- `requested_by_id` - Foreign key to users
- `approved_by_id` - Foreign key to users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 9. `reorder_request_items` (Reorder Request Items Table)
**Purpose**: Individual items within reorder requests
**Key Fields**:
- `id` (Primary Key)
- `reorder_request_id` - Foreign key to reorder_requests
- `inventory_id` - Foreign key to inventories
- `requested_quantity` - Requested quantity
- `approved_quantity` - Approved quantity
- `unit_price` - Estimated unit price
- `total_price` - Total line price
- `status` - Line item status

## User Management Tables

### 10. `users` (Users Table)
**Purpose**: System users and authentication
**Key Fields**:
- `id` (Primary Key)
- `name` - User full name
- `email` - User email (unique)
- `password_hash` - Encrypted password
- `role` - User role (admin/manager/user)
- `department` - User department
- `status` - User status (active/inactive)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## AI Integration Tables

### 11. `ai_usage_logs` (AI Usage Tracking)
**Purpose**: Track AI API usage for cost management
**Key Fields**:
- `id` (Primary Key)
- `user_id` - Foreign key to users
- `operation` - AI operation type
- `tokens_used` - Number of tokens consumed
- `cost` - Estimated cost
- `success` - Operation success status
- `created_at` - Usage timestamp

## Key Relationships

1. **Item Masters → Inventories**: One-to-Many (one item can have multiple inventory records in different locations)
2. **Item Masters → UNSPSC Codes**: Many-to-One (many items can share the same UNSPSC code)
3. **Warehouses → Storage Locations**: One-to-Many
4. **Storage Locations → Bin Locations**: One-to-Many
5. **Inventories → Transaction Items**: One-to-Many
6. **Users → Item Masters**: One-to-Many (creator/updater relationships)

## AI-Enhanced Fields

The following fields in `item_masters` table are automatically generated by AI:
- `short_description` (enhanced/corrected)
- `long_description` (detailed technical specs)
- `standard_description` (NOUN, MODIFIER format)
- `manufacturer_name` (suggested based on item type)
- `manufacturer_part_number` (typical pattern)
- `equipment_category` (classified by AI)
- `equipment_sub_category` (detailed classification)
- `unspsc_code` (AI-generated 8-digit code)
- `unit_of_measure` (AI-suggested UOM)
- `criticality` (AI-assessed importance)
- `stock_item` (AI recommendation)
- `planned_stock` (AI recommendation)

## Database Indexes

For optimal performance, the following indexes are recommended:
- `item_masters(item_number)` - Unique index
- `item_masters(short_description)` - Text search
- `item_masters(equipment_category, equipment_sub_category)` - Category search
- `item_masters(unspsc_code)` - Classification search
- `inventories(item_master_id, warehouse_id)` - Inventory lookup
- `transaction_items(inventory_id, transaction_date)` - Transaction history

This comprehensive database structure supports full Item Master lifecycle management with AI enhancement, inventory tracking, and location management.
