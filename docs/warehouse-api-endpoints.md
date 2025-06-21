# Warehouse Management API Documentation

This document provides comprehensive details about the Warehouse Management API endpoints in our ERP system.

## Base URL

All API endpoints are prefixed with: `/api/warehouse`

## Authentication

All endpoints require authentication. Include a valid JWT token in the request header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Storage Location Endpoints

### Create Storage Location
- **URL**: `/storage-location`
- **Method**: `POST`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "code": "WH001",
    "description": "Main Warehouse",
    "street": "123 Main Street",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "code": "WH001",
      "description": "Main Warehouse",
      "street": "123 Main Street",
      "city": "New York",
      "postalCode": "10001",
      "country": "USA",
      "isActive": true,
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:00:00.000Z"
    }
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Storage location with this code already exists"
  }
  ```

### Get All Storage Locations
- **URL**: `/storage-location`
- **Method**: `GET`
- **Access**: Private
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "uuid-here",
        "code": "WH001",
        "description": "Main Warehouse",
        "street": "123 Main Street",
        "city": "New York",
        "postalCode": "10001",
        "country": "USA",
        "isActive": true,
        "createdById": "user-uuid",
        "createdAt": "2025-05-30T12:00:00.000Z",
        "updatedAt": "2025-05-30T12:00:00.000Z",
        "createdBy": {
          "id": "user-uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        }
      }
    ]
  }
  ```

### Get Storage Location by ID
- **URL**: `/storage-location/:id`
- **Method**: `GET`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "code": "WH001",
      "description": "Main Warehouse",
      "street": "123 Main Street",
      "city": "New York",
      "postalCode": "10001",
      "country": "USA",
      "isActive": true,
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:00:00.000Z",
      "createdBy": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "success": false,
    "message": "Storage location not found"
  }
  ```

### Update Storage Location
- **URL**: `/storage-location/:id`
- **Method**: `PUT`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Request Body**:
  ```json
  {
    "code": "WH001-UPDATED",
    "description": "Main Warehouse Updated",
    "street": "456 Main Street",
    "city": "Los Angeles",
    "postalCode": "90001",
    "country": "USA",
    "isActive": true
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "code": "WH001-UPDATED",
      "description": "Main Warehouse Updated",
      "street": "456 Main Street",
      "city": "Los Angeles",
      "postalCode": "90001",
      "country": "USA",
      "isActive": true,
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:30:00.000Z"
    },
    "message": "Storage location updated successfully"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "success": false,
    "message": "Storage location not found"
  }
  ```

### Delete Storage Location
- **URL**: `/storage-location/:id`
- **Method**: `DELETE`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Storage location deleted successfully"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Cannot delete storage location with associated bins. Please delete the bins first."
  }
  ```

## Bin Location Endpoints

### Create Bin Location
- **URL**: `/bin-location`
- **Method**: `POST`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "binCode": "BIN-A1",
    "storageLocationId": "storage-location-uuid",
    "description": "Shelf A1"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "binCode": "BIN-A1",
      "description": "Shelf A1",
      "isActive": true,
      "storageLocationId": "storage-location-uuid",
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:00:00.000Z",
      "storageLocation": {
        "id": "storage-location-uuid",
        "code": "WH001",
        "description": "Main Warehouse"
      },
      "createdBy": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Bin with this code already exists in this storage location"
  }
  ```

### Get All Bin Locations
- **URL**: `/bin-location`
- **Method**: `GET`
- **Access**: Private
- **Query Parameters**: `storageLocationId=[uuid]` (optional)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "uuid-here",
        "binCode": "BIN-A1",
        "description": "Shelf A1",
        "isActive": true,
        "storageLocationId": "storage-location-uuid",
        "createdById": "user-uuid",
        "createdAt": "2025-05-30T12:00:00.000Z",
        "updatedAt": "2025-05-30T12:00:00.000Z",
        "storageLocation": {
          "id": "storage-location-uuid",
          "code": "WH001",
          "description": "Main Warehouse"
        },
        "createdBy": {
          "id": "user-uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        }
      }
    ]
  }
  ```

### Get Bin Location by ID
- **URL**: `/bin-location/:id`
- **Method**: `GET`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "binCode": "BIN-A1",
      "description": "Shelf A1",
      "isActive": true,
      "storageLocationId": "storage-location-uuid",
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:00:00.000Z",
      "storageLocation": {
        "id": "storage-location-uuid",
        "code": "WH001",
        "description": "Main Warehouse"
      },
      "createdBy": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "success": false,
    "message": "Bin location not found"
  }
  ```

### Update Bin Location
- **URL**: `/bin-location/:id`
- **Method**: `PUT`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Request Body**:
  ```json
  {
    "binCode": "BIN-A1-UPDATED",
    "description": "Shelf A1 Updated",
    "storageLocationId": "storage-location-uuid",
    "isActive": true
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "binCode": "BIN-A1-UPDATED",
      "description": "Shelf A1 Updated",
      "isActive": true,
      "storageLocationId": "storage-location-uuid",
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:30:00.000Z"
    },
    "message": "Bin location updated successfully"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "success": false,
    "message": "Bin location not found"
  }
  ```

### Delete Bin Location
- **URL**: `/bin-location/:id`
- **Method**: `DELETE`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Bin location deleted successfully"
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Cannot delete bin location with associated inventory items."
  }
  ```

### Get Bins by Storage Location
- **URL**: `/storage-location/:id/bins`
- **Method**: `GET`
- **Access**: Private
- **URL Parameters**: `id=[storage-location-uuid]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "uuid-here",
        "binCode": "BIN-A1",
        "description": "Shelf A1",
        "isActive": true,
        "storageLocationId": "storage-location-uuid",
        "createdById": "user-uuid",
        "createdAt": "2025-05-30T12:00:00.000Z",
        "updatedAt": "2025-05-30T12:00:00.000Z",
        "storageLocation": {
          "id": "storage-location-uuid",
          "code": "WH001",
          "description": "Main Warehouse"
        }
      }
    ]
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "success": false,
    "message": "Storage location not found"
  }
  ```

## Transaction Endpoints

### Create Transaction
- **URL**: `/transaction`
- **Method**: `POST`
- **Access**: Private
- **Description**: Create a new transaction (GR: Goods Receipt, GI: Goods Issue, GE: Goods Return, GT: Goods Transfer)
- **Request Body**:
  ```json
  {
    "transactionType": "GR",
    "referenceNumber": "PO12345",
    "costCenter": "CC001",
    "items": [
      {
        "inventoryId": "inventory-uuid",
        "sourceLocationId": "source-location-uuid",
        "destinationLocationId": "destination-location-uuid",
        "sourceBinId": "source-bin-uuid",
        "destinationBinId": "destination-bin-uuid",
        "quantity": 10,
        "unitPrice": 25.50,
        "notes": "Sample notes"
      }
    ]
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "transactionType": "GR",
      "referenceNumber": "PO12345",
      "costCenter": "CC001",
      "status": "DRAFT",
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:00:00.000Z",
      "items": [
        {
          "id": "transaction-item-uuid",
          "transactionId": "uuid-here",
          "inventoryId": "inventory-uuid",
          "sourceLocationId": "source-location-uuid",
          "destinationLocationId": "destination-location-uuid",
          "sourceBinId": "source-bin-uuid",
          "destinationBinId": "destination-bin-uuid",
          "quantity": 10,
          "unitPrice": 25.50,
          "notes": "Sample notes",
          "inventory": {
            "id": "inventory-uuid",
            "itemMaster": {
              "id": "item-master-uuid",
              "itemNumber": "ITEM001",
              "shortDescription": "Sample Item"
            }
          },
          "sourceLocation": {
            "id": "source-location-uuid",
            "code": "WH001",
            "description": "Main Warehouse"
          },
          "destinationLocation": {
            "id": "destination-location-uuid",
            "code": "WH002",
            "description": "Secondary Warehouse"
          }
        }
      ],
      "createdBy": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Invalid transaction type"
  }
  ```

### Get All Transactions
- **URL**: `/transaction`
- **Method**: `GET`
- **Access**: Private
- **Query Parameters**:
  - `transactionType=[GR|GI|GE|GT]` (optional)
  - `status=[DRAFT|PENDING|COMPLETED|CANCELLED]` (optional)
  - `referenceNumber=[string]` (optional)
  - `startDate=[ISO date]` (optional)
  - `endDate=[ISO date]` (optional)
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "uuid-here",
        "transactionType": "GR",
        "referenceNumber": "PO12345",
        "costCenter": "CC001",
        "status": "DRAFT",
        "createdById": "user-uuid",
        "createdAt": "2025-05-30T12:00:00.000Z",
        "updatedAt": "2025-05-30T12:00:00.000Z",
        "items": [...],
        "createdBy": {...},
        "completedBy": null
      }
    ]
  }
  ```

### Get Transaction by ID
- **URL**: `/transaction/:id`
- **Method**: `GET`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "transactionType": "GR",
      "referenceNumber": "PO12345",
      "costCenter": "CC001",
      "status": "DRAFT",
      "createdById": "user-uuid",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T12:00:00.000Z",
      "items": [...],
      "createdBy": {...},
      "completedBy": null
    }
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "success": false,
    "message": "Transaction not found"
  }
  ```

### Get Transactions by Type
- **URL**: `/transaction/type/:type`
- **Method**: `GET`
- **Access**: Private
- **URL Parameters**: `type=[GR|GI|GE|GT]`
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "count": 1,
    "data": [...]
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Invalid transaction type"
  }
  ```

### Complete Transaction
- **URL**: `/transaction/:id/complete`
- **Method**: `PUT`
- **Access**: Private
- **URL Parameters**: `id=[uuid]`
- **Description**: Completes a transaction and updates inventory quantities based on transaction type
- **Success Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-here",
      "transactionType": "GR",
      "referenceNumber": "PO12345",
      "costCenter": "CC001",
      "status": "COMPLETED",
      "createdById": "user-uuid",
      "completedById": "user-uuid",
      "completedAt": "2025-05-30T13:00:00.000Z",
      "createdAt": "2025-05-30T12:00:00.000Z",
      "updatedAt": "2025-05-30T13:00:00.000Z",
      "items": [...],
      "createdBy": {...},
      "completedBy": {...}
    }
  }
  ```
- **Error Response**: `400 Bad Request`
  ```json
  {
    "success": false,
    "message": "Transaction is already COMPLETED"
  }
  ```

## Transaction Types

- **GR (Goods Receipt)**: Increases inventory quantity
- **GI (Goods Issue)**: Decreases inventory quantity
- **GE (Goods Return)**: Increases inventory quantity
- **GT (Goods Transfer)**: Moves inventory between locations

## Error Codes

- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication token is missing or invalid
- `403 Forbidden`: User doesn't have permission for the operation
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: Server-side error
