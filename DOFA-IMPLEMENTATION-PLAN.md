# Delegation of Financial Authority (DoFA) Implementation Plan

## Overview
This document outlines the implementation of a Delegation of Financial Authority (DoFA) system for the ERP application. The DoFA system will control approval routing for Purchase Requisitions (PR), Request for Quotations (RFQ), and Purchase Orders (PO) based on monetary thresholds and cost centers.

## DoFA Business Rules

### Approval Thresholds
- Up to $500: Farhad
- Up to $3,000: Rashad
- Up to $5,000: Fakhri
- Up to $10,000: Samira
- Above $10,000: Rufat

### Approval Process Flow
1. Requestor creates PR and selects initial approver
2. PR is routed to selected approver first
3. Once approved, system checks DoFA thresholds
4. If PR value exceeds approver's threshold, it's routed to the next approver in the hierarchy
5. Cascade continues until final approval from an approver with sufficient DoFA threshold

## Implementation Components

### 1. Database Schema Updates
- Create DoFA tables:
  - `DoFALevels` - Define approval thresholds and associated approvers
  - `DoFACostCenters` - Link cost centers to DoFA approvers (optional)
  - `ApprovalWorkflows` - Track multi-step approval processes

### 2. Backend Components
- DoFA Models
  - Define data models for DoFA levels, mappings, and workflow
- DoFA Controllers
  - CRUD operations for DoFA settings
  - Approval routing logic
- DoFA Routes
  - REST endpoints for DoFA management and lookups
- Middleware
  - Approval routing middleware to enhance PR/RFQ/PO with next approvers

### 3. Frontend Components
- DoFA Management UI
  - CRUD interface for DoFA settings
  - Threshold management
  - Approver assignments
  - Cost center mappings
- DoFA Visualization
  - View approval chains
  - Current approval status
- Enhanced PR/RFQ/PO Forms
  - Show approval routing information
  - Display next approvers in chain

## Implementation Phases

### Phase 1: Core DoFA Setup
1. Create database schema for DoFA
2. Implement basic DoFA models and controllers
3. Create DoFA management UI
4. Update PR form to include DoFA logic

### Phase 2: Enhanced Routing
1. Implement cascade approval logic
2. Add approval history with DoFA context
3. Enhance notification system for approvals
4. Integrate with RFQ and PO modules

### Phase 3: Cost Center Integration
1. Implement cost center to DoFA mapping
2. Create cost center management UI
3. Customize approval routing based on cost center

## UI/UX Considerations
- Clear indication of approval chain for requestors
- Visual representation of approval status
- Notifications for pending approvals
- Audit trail of approval decisions
