# AI Context Service - Production Service

Production-ready NestJS backend service for the AI Context Service, built with TypeScript, PostgreSQL, and JWT authentication.

## Architecture

This service implements a clean, modular architecture with the following key components:

- **NestJS Framework**: Enforces clean architecture patterns with dependency injection
- **PostgreSQL Database**: Scalable, ACID-compliant data storage with TypeORM
- **JWT Authentication**: Custom JWT-based authentication with refresh tokens
- **Module System**: Database-driven module template system
- **MCP Protocol**: Integration with Anthropic's Model Context Protocol

## Directory Structure

```
src/
├── auth/                    # Authentication module (JWT, login, register)
├── users/                   # User management module  
├── database/                # Database configuration and migrations
├── modules/                 # Module template system
├── projects/                # Project management
├── mcp/                     # MCP protocol implementation
├── common/                  # Shared utilities (decorators, guards, etc.)
├── config/                  # Configuration management
└── main.ts                  # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=ai_context_dev
DATABASE_PASSWORD=dev_password
DATABASE_NAME=ai_context_development

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
```

### Installation

```bash
# Install dependencies
npm install

# Start PostgreSQL database (ensure it's running)
# Create database: ai_context_development

# Run the application
npm run start:dev
```

The service will be available at: `http://localhost:3000/api/v1`

## Available Scripts

```bash
# Development
npm run start          # Start the application
npm run start:dev      # Start with file watching
npm run start:debug    # Start with debugging enabled

# Production  
npm run build          # Build the application
npm run start:prod     # Start production build

# Testing
npm run test           # Unit tests
npm run test:watch     # Unit tests with watching
npm run test:cov       # Unit tests with coverage
npm run test:e2e       # End-to-end tests

# Database
npm run migration:generate  # Generate new migration
npm run migration:run       # Run pending migrations
npm run migration:revert    # Revert last migration
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration  
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID

### Health Check
- `GET /api/v1` - Service health check

## Development Status

### ✅ Completed (Work Item 1)
- [x] NestJS project initialization with TypeScript
- [x] Production dependencies installed
- [x] Clean directory structure established  
- [x] Configuration management setup
- [x] Database module with TypeORM
- [x] Basic User entity and module
- [x] Authentication module foundation
- [x] Environment configuration
- [x] Global validation and CORS setup

### 🚧 Next Steps (Work Item 2)
- [ ] Complete database schema design
- [ ] Implement database migrations
- [ ] Add Module and Project entities
- [ ] Complete authentication implementation
- [ ] Add JWT guards and strategies
- [ ] Implement MCP protocol integration

## Migration from Prototype

This service is designed to replace the file-based prototype system with a scalable, database-driven architecture while preserving the core functionality:

- **Users**: Migrate from `users/*/profile/user.json` to PostgreSQL
- **Projects**: Migrate from `users/*/projects/*` to database entities  
- **Modules**: Migrate from `modules/*` to database-driven templates
- **MCP Logic**: Port from `server-persistent.js` to clean service architecture

## Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with bcrypt
- **Validation**: class-validator, class-transformer
- **Testing**: Jest with Supertest
- **API**: RESTful APIs with global validation

## Support

For issues and questions related to the AI Context Service production architecture, refer to the project documentation in the `AI_context_service_docs` repository.