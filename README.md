# ERP System - Fresh Start

This is a fresh start for the ERP system, with all modules removed except the frontend structure.

## Directory Structure

- `frontend/` - Contains the frontend React application (preserved)
- `backend/` - New backend directory structure
  - `src/` - Source code
  - `config/` - Configuration files
  - `controllers/` - API controllers
  - `models/` - Data models
  - `routes/` - API routes
  - `middleware/` - Express middleware
  - `utils/` - Utility functions

## Next Steps

1. Set up the new backend according to requirements
2. Connect the frontend to the new backend
3. Implement new modules as needed

## Getting Started

To start development:

1. Set up the backend:
   ```
   cd backend
   npm init -y
   npm install express mongoose dotenv cors
   ```

2. Start the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

The main navigation menu has been cleared and is ready for new module entries.
