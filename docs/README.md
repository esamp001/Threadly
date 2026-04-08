# Space Project Documentation

This directory contains the complete specification-driven documentation for the Space social media platform.

## Documentation Structure

### 📋 Global Specifications
- [**Architecture Overview**](./global/architecture.md) - System architecture and high-level design
- [**Database Schema**](./global/database-schema.md) - Complete database structure and relationships
- [**API Specification**](./global/api-specification.md) - RESTful API endpoints and contracts
- [**Authentication & Authorization**](./global/auth.md) - Security and user management
- [**Deployment & Infrastructure**](./global/deployment.md) - Deployment configuration and infrastructure

### 🖥️ Frontend Specifications
- [**Frontend Architecture**](./frontend/architecture.md) - React app structure and patterns
- [**State Management**](./frontend/state-management.md) - Data flow and state handling
- [**UI/UX Guidelines**](./frontend/ui-ux-guidelines.md) - Design system and user experience
- [**Component Library**](./frontend/components.md) - Reusable components and their specs

### 🔧 Backend Specifications
- [**Backend Architecture**](./backend/architecture.md) - Node.js server structure and patterns
- [**Database Layer**](./backend/database.md) - Database operations and migrations
- [**API Routes**](./backend/routes.md) - All API route specifications
- [**Middleware & Services**](./backend/middleware.md) - Authentication, validation, and business logic

### 📦 Module Specifications
- [**User Management**](./modules/user-management.md) - User registration, profiles, and settings

*More modules will be added as they are implemented.*


## Documentation Standards

Each specification document follows this structure:
1. **Purpose** - What the module does
2. **Dependencies** - What it depends on
3. **API/Interface** - How it interacts with other parts
4. **Implementation Details** - Technical specifications
5. **Testing Requirements** - What needs to be tested

## Contributing

When making changes to the codebase:
1. Update the relevant specification documents first
2. Implement the changes according to the specifications
3. Update the documentation if the implementation differs from the spec

## Adding New Documentation

**Important:** Always create corresponding `.md` files when adding new modules or major features:
- New modules → Add to `/docs/modules/` 
- New frontend patterns → Add to `/docs/frontend/`
- New backend services → Add to `/docs/backend/`
- Global changes → Add to `/docs/global/`

Update this README.md to include links to new documentation files.

## Documentation Guidelines

**Critical:** When creating or updating documentation:
- **NEVER make assumptions** about code functionality
- **ALWAYS verify** by checking actual implementation
- **ASK FIRST** if unsure about any technical details
- **Cross-reference** multiple sources to ensure accuracy
- **Document what exists**, not what you think should exist

This spec-driven approach ensures consistency, maintainability, and clear understanding of the system architecture.
