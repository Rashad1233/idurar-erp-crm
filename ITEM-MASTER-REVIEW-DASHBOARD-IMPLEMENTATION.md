# Item Master Review Dashboard Implementation

## Overview
The Item Master Review Dashboard provides a comprehensive interface for reviewers to manage the approval workflow for new Item Master submissions. This addresses the question "where will items be reviewed" by creating a dedicated reviewer interface.

## Review Dashboard Location
**Access URL**: `/item-master/review`

**Navigation**: 
- Available from main Item Master page (`/item-master`) via "Review Dashboard" button
- Direct URL access for authorized reviewers

## Key Features Implemented

### 📊 Review Statistics Dashboard
- **Pending Review Count**: Shows total items awaiting review
- **Urgent Items**: Highlights items older than 3 days (red alert)
- **High Criticality**: Count of high-priority items needing immediate attention
- **Categories**: Number of different equipment categories in review queue

### 🔍 Advanced Filtering & Search
- **Text Search**: Search by item number, description, manufacturer
- **Category Filter**: Filter by equipment category
- **Criticality Filter**: Filter by HIGH, MEDIUM, LOW, NO
- **Real-time Updates**: Filters apply immediately

### 📋 Review Queue Management
**Priority Sorting**:
1. **Urgent Priority**: Items older than 3+ days (red badge)
2. **High Priority**: Items 1-3 days old (orange badge)  
3. **Normal Priority**: Items submitted today (blue badge)
4. **Criticality Sorting**: HIGH > MEDIUM > LOW > NO
5. **Age Sorting**: Oldest submissions first (FIFO)

### 👥 Review Actions
**For Each Pending Item**:
- **View Details**: Comprehensive item information modal
- **Approve**: Assigns final item number and moves to APPROVED status
- **Reject**: Sends back to creator with REJECTED status

### 🎯 Approval Process
When reviewer clicks **"Approve"**:
1. **Confirmation Dialog**: Shows item details and consequences
2. **Final Number Generation**: Replaces interim number (TEMP-YYYYMMDD-XXX)
3. **Status Update**: Changes from PENDING_REVIEW → APPROVED
4. **Audit Trail**: Records reviewer ID and timestamp
5. **Success Message**: "✅ Item approved! Final number assigned: [FINAL-NUMBER]"

**Final Number Format**: `CATEGORY-SUBCATEGORY-YYYYMMDD-XXX`
- Example: `VALVE-GATE-20250620-001`

### ❌ Rejection Process
When reviewer clicks **"Reject"**:
1. **Confirmation Dialog**: Shows impact and next steps
2. **Status Update**: Changes from PENDING_REVIEW → REJECTED
3. **Return to Creator**: Item becomes editable again for revision
4. **Notification**: "❌ Item rejected and sent back for revision"

## Review Interface Features

### 📝 Item Detail Modal for Review
**Review Checklist Displayed**:
- ✓ Standard description follows NOUN, MODIFIER format
- ✓ Equipment category and sub-category are correct
- ✓ Manufacturer information is accurate
- ✓ UNSPSC code is appropriate
- ✓ Stock configuration matches business requirements

**Information Shown**:
- **Current Interim Number**: Highlighted in orange
- **Proposed Final Number**: Shown in green (preview)
- **All Item Details**: Complete specifications
- **Stock Configuration**: ST1/ST2/NS3 with explanations
- **Creator Information**: Who submitted the item

### 🔄 Workflow Integration
**Status Transitions**:
```
DRAFT → PENDING_REVIEW → APPROVED
                    ↓
                 REJECTED (back to creator)
```

**Post-Approval Actions Available**:
- Set Min/Max stock levels (for ST2 items)
- Add to contracts
- Configure supplier relationships

## Backend Implementation

### API Endpoints
- **GET** `/api/item/pending-review` - Fetch items awaiting review
- **PUT** `/api/item/:id` - Update item status (approve/reject)

### Database Updates
**Review Tracking Fields**:
- `reviewedById`: ID of the reviewer
- `reviewedAt`: Timestamp of review action
- `status`: DRAFT → PENDING_REVIEW → APPROVED/REJECTED

### Final Number Generation
**Algorithm**:
```javascript
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
```

## User Experience Flow

### For Reviewers:
1. **Access Dashboard**: Navigate to `/item-master/review`
2. **See Pending Queue**: View all items awaiting review with priority indicators
3. **Filter/Search**: Use filters to focus on specific items
4. **Review Details**: Click to view comprehensive item information
5. **Make Decision**: Approve or reject with detailed confirmation dialogs
6. **Track Progress**: See immediate updates and success messages

### For Item Creators:
1. **Submit Item**: Status changes to PENDING_REVIEW
2. **Wait for Review**: Item becomes read-only during review
3. **Receive Decision**: 
   - **If Approved**: Item gets final number and becomes operational
   - **If Rejected**: Item returns to DRAFT status for editing

## Integration Points

### Navigation
- **From Main Item Master**: "Review Dashboard" button
- **Direct Access**: URL routing for bookmarking
- **Role-Based**: Can be restricted to reviewer roles

### Notifications
- **Success Messages**: Clear feedback for all actions
- **Priority Indicators**: Visual cues for urgent items
- **Status Updates**: Real-time workflow state changes

### Reporting
- **Queue Statistics**: Dashboard metrics for management
- **Review Performance**: Track review times and volumes
- **Category Analytics**: Review patterns by equipment type

## Example Review Scenario

### Gate Valve Review:
```
Interim Number: TEMP-20250620-001
Description: VALVE, GATE: 12IN, CLASS 300, STAINLESS STEEL
Manufacturer: GALPERT
Category: VALVE / GATE
Status: PENDING_REVIEW

→ Reviewer clicks "Approve"
→ Final Number: VALVE-GATE-20250620-001
→ Status: APPROVED
→ Available for operational use
```

## Security & Access Control
- **Authentication Required**: Protected routes
- **Role-Based Access**: Can be restricted to reviewer roles
- **Audit Trail**: Complete tracking of review actions
- **User Identification**: Reviewer ID recorded for accountability

This comprehensive review dashboard ensures that all Item Master submissions go through proper quality control while providing reviewers with efficient tools to manage the approval workflow.

## Files Added/Modified
- **Frontend**: `frontend/src/pages/ItemMaster/ItemMasterReviewDashboard.jsx`
- **Backend**: Added `getPendingReviewItems` to `itemMasterController.js`
- **Routes**: Updated `inventoryRoutes.jsx` and `itemRoutes.js`
- **Navigation**: Enhanced main Item Master page with Review Dashboard link

The review process is now fully operational with a professional, user-friendly interface that handles the complete approval workflow efficiently.
