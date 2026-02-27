# Backend Instructions

## Database
- Use Knex.js for all database operations
- All migrations must use ES module syntax (export function up/down)
- Follow the existing table structure patterns
- Use snake_case for all database column names
- Always include timestamps (created_at, updated_at) in tables
- Use proper foreign key relationships with onDelete constraints
- Always add indexing for creating migrations and queries for better performance
- Register all new routes in /src/app.js with proper path prefix

## API Routes
- All routes in /src/routes/
- Use async/await for database operations
- API routes naming convention: {resource}.routes.js - ex. users.routes.js, posts.routes.js, topics.routes.js
- Route paths follow RESTful patterns: GET /api/users, POST /api/users, GET /api/users/:id
- Include proper error handling with status codes
- Follow RESTful conventions
- All API responses must follow {status, message, data?} format
- Use Express Router for modular route organization
- Use knex.transaction for multi-table operations
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)

## Environment
- Load .env from project root: dotenv.config({ path: '../.env' })
- Never commit .env files to version control
- Use environment variables for all sensitive data (DB credentials, API keys)
- Include proper CORS configuration for frontend access

## File Handling
- Use multer for file uploads
- Integrate with Cloudinary for image storage
- Include file validation (type, size) before processing
- Handle file cleanup on errors

## Security
- Include proper input sanitization
- Use parameterized queries via Knex.js
- Implement proper authentication/authorization
- Include rate limiting for sensitive endpoints

## Error Handling
- Use try-catch blocks for all async operations
- Log errors with context for debugging
- Return user-friendly error messages
- Include proper error status codes