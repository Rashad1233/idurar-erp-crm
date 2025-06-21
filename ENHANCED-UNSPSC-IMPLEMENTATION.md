# Enhanced UNSPSC System with GPT-4.1 Nano Integration

## Overview
This enhancement integrates GPT-4.1 Nano with our ERP system to provide improved UNSPSC code searching, management, and detailed information display. The implementation allows users to search for UNSPSC codes using natural language, save favorite codes, and view detailed hierarchical information for each code.

## Features Added

1. **AI-Powered UNSPSC Search**
   - Uses OpenAI's GPT-4.1 Nano to search for UNSPSC codes based on natural language descriptions
   - Returns hierarchical information (segment, family, class, commodity)
   - Caches results in the database for future use

2. **Detailed UNSPSC Code Information**
   - Shows complete hierarchy for each code
   - Provides detailed descriptions for each level
   - Includes examples of products/services that fall under the code

3. **UNSPSC Favorites Management**
   - Users can save frequently used UNSPSC codes as favorites
   - Add notes to saved codes
   - View and manage all favorites from a dedicated page

4. **Clickable UNSPSC Codes in Item Master**
   - UNSPSC codes in Item Master view are now clickable
   - Clicking a code opens its detailed information
   - Provides easy access to code hierarchy and description

5. **Complete Code Management**
   - Any code used or favorited has its description stored
   - All codes used in the system are accessible via a dedicated route
   - Detailed information is always available for any code in the system

## Technical Implementation

1. **Backend**
   - Updated OpenAI service to use GPT-4.1 Nano API
   - Enhanced UNSPSC routes for search, details, and favorites management
   - Database tables for storing UNSPSC codes and user favorites

2. **Frontend**
   - Enhanced UNSPSC search page
   - Detailed code information display
   - Favorites management UI
   - Made UNSPSC codes clickable in Item Master view

## How to Use

1. **Search for UNSPSC Codes**
   - Navigate to the UNSPSC Enhanced Search page
   - Enter a natural language description of the product/service
   - View matching UNSPSC codes with their hierarchy

2. **View UNSPSC Code Details**
   - Click on any UNSPSC code in the system
   - View complete hierarchy information
   - See detailed descriptions and examples

3. **Manage Favorites**
   - Save frequently used codes as favorites
   - Add notes for specific use cases
   - Access all favorites from the Favorites tab

4. **From Item Master**
   - Click on any UNSPSC code in the Item Master view
   - View detailed information about the code
   - Add the code to favorites if needed

## Setup Instructions

1. Ensure the OpenAI API key is set in the `.env` file
2. Run the `setup-unspsc-tables.js` script to ensure database tables are created
3. Run the `run-enhanced-unspsc-test.ps1` script to test the implementation
4. Restart the backend server to apply changes

## Notes

- The system caches UNSPSC code information to reduce API calls
- When a code is used in the system, its most precise description is always filled in
- All UNSPSC codes used in the system are accessible via the enhanced search page
