# AGENT.md - Development Guide

## Build/Lint/Test Commands
- **Frontend**: `cd frontend && npm run dev` (port 3000), `npm run build`, `npm run lint`
- **Backend**: `cd backend && npm run dev` (port 8888), `npm start` 
- **Test**: No test framework configured (both frontend/backend have placeholder test scripts)
- **Lint**: `cd frontend && npm run lint` (ESLint for React)

## Architecture & Structure
- **Stack**: React 18 + Vite frontend, Express.js + Node.js backend, PostgreSQL + Sequelize ORM
- **Frontend**: Ant Design UI, Redux Toolkit, React Router, located in `frontend/src/`
- **Backend**: Express API in `backend/src/`, models split into `coreModels/` and `appModels/`
- **Database**: PostgreSQL with Sequelize, config in `backend/config/postgresql.js`
- **API**: RESTful endpoints, proxy from frontend to backend via Vite dev server

## Code Style & Conventions
- **Imports**: Use `@/` alias for frontend src imports, organized by type (React, Ant Design, local)
- **Components**: Functional components with hooks, export default pattern
- **Backend**: CommonJS modules, model-controller-route structure
- **Database**: Sequelize models with camelCase properties, foreign key relationships
- **Naming**: camelCase for JS, PascalCase for React components, snake_case for database columns
- **Error Handling**: Try-catch blocks in async functions, proper HTTP status codes
- **No PropTypes**: ESLint rule disabled, prefer TypeScript-style commenting for prop documentation
