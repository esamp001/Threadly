# Backend Architecture

## Purpose
This document describes the backend architecture of the Space platform, including server structure, API design patterns, and data flow.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: PostgreSQL with Knex.js 3.1.0 ORM
- **Authentication**: JWT + bcryptjs 3.0.3
- **File Storage**: Cloudinary 2.9.0
- **Environment**: dotenv 17.2.4
- **Development**: nodemon 3.1.11

## Project Structure

```
backend/src/
├── routes/                 # API route handlers
│   ├── auth.routes.js     # Authentication endpoints
│   ├── comments.routes.js # Comment management
│   ├── header.routes.js   # Header data
│   ├── login.routes.js    # Login specific logic
│   ├── maincontent.routes.js # Main content
│   ├── onboarding.routes.js # User onboarding
│   └── cloudinary.js      # File upload routes
├── middleware/             # Custom middleware
├── db/                     # Database configuration
│   ├── knex.js           # Knex configuration
│   ├── migrations/       # Database migrations
│   └── seeds/            # Database seeds
├── cloudinary/            # File upload handling
├── utils/                 # Utility functions
├── app.js                 # Express app configuration
└── server.js              # Server entry point
```

## Server Architecture

### Application Entry Point
```javascript
// server.js
import app from './app.js';
import { PORT } from './config/config.js';

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

### Express App Configuration
```javascript
// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes.js';
import { commentsRoutes } from './routes/comments.routes.js';
import { mainContentRoutes } from './routes/maincontent.routes.js';
import { onboardingRoutes } from './routes/onboarding.routes.js';
import { cloudinaryRoutes } from './routes/cloudinary.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/maincontent', mainContentRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/upload', cloudinaryRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

export default app;
```

## Database Architecture

### Knex Configuration
```javascript
// db/knex.js
import knex from 'knex';
import config from '../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

export default db;
```

### Database Configuration
```javascript
// knexfile.js
export default {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'threadly_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    migrations: {
      directory: './backend/src/db/migrations'
    },
    seeds: {
      directory: './backend/src/db/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './backend/src/db/migrations'
    },
    seeds: {
      directory: './backend/src/db/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
```

## Route Architecture

### Route Structure Pattern
Each route follows a consistent structure:

```javascript
// routes/example.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { exampleSchema } from '../schemas/example.schema.js';

const router = express.Router();

// Middleware for all routes in this file
router.use(authenticateToken);

// GET /api/example
router.get('/', async (req, res) => {
  try {
    // Route logic
    res.json({
      success: true,
      data: result,
      message: 'Operation successful'
    });
  } catch (error) {
    handleError(res, error);
  }
});

// POST /api/example
router.post('/', validateRequest(exampleSchema), async (req, res) => {
  try {
    // Route logic
    res.status(201).json({
      success: true,
      data: result,
      message: 'Resource created successfully'
    });
  } catch (error) {
    handleError(res, error);
  }
});

export { router as exampleRoutes };
```

### Parameter Validation Requirements
**Always validate parameters before executing database queries.** This is a mandatory security practice to prevent SQL injection, invalid data processing, and unnecessary database load.

**Validation Checklist:**
- **Route Parameters (req.params)**: Validate ID format, existence, and type before queries
- **Query Parameters (req.query)**: Validate pagination, filters, and sorting parameters
- **Request Body (req.body)**: Validate required fields, data types, and constraints
- **File Uploads**: Validate file type, size, and format before processing

**Preferred Pattern:**
```javascript
// GET /api/spaces/:id
router.get('/:id', checkAuth, async (req, res) => {
  const { id } = req.params;

  let space = null;
  let error_message = '';
  let status = 200;
  let success = true;

  try {
    // Validates required parameters before executing query
    if (!id) {
      status = 400;
      error_message = 'Space ID is required';
      success = false;
      throw new Error('Space ID is required');
    }

    // Additional validation for ID format if needed
    if (isNaN(id) || parseInt(id) <= 0) {
      status = 400;
      error_message = 'Invalid Space ID format';
      success = false;
      throw new Error('Invalid Space ID format');
    }

    // Proceed with database query only after validation passes
    space = await knex('spaces')
      .select('*')
      .where('id', id)
      .first();

    // ... rest of route logic
  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({ success, status, error_message, space });
  }
});
```

**Avoid:**
```javascript
// BAD: No validation before query
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  // Directly queries database without validating id
  const space = await knex('spaces').where('id', id).first();
  // ...
});
```

### Authentication Routes
```javascript
// routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/knex.js';
import { validateRequest } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Check if user exists
    const existingUser = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email or username already exists'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [user] = await db('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        display_name: displayName
      })
      .returning(['id', 'username', 'email', 'display_name', 'created_at']);

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          isOnboarded: false,
          createdAt: user.created_at
        },
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Failed to register user'
      }
    });
  }
});

// POST /api/auth/login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db('users')
      .where('email', email)
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          isOnboarded: user.is_onboarded
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to login'
      }
    });
  }
});

export { router as authRoutes };
```

## Middleware Architecture

### Authentication Middleware
```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';
import db from '../db/knex.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access token required'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists
    const user = await db('users')
      .where('id', decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expired'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db('users')
        .where('id', decoded.userId)
        .first();

      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
```

### Validation Middleware
```javascript
// middleware/validation.js
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};
```

### Error Handling Middleware
```javascript
// middleware/errorHandler.js
export const handleError = (res, error, customMessage = null) => {
  console.error('API Error:', error);

  // Handle specific error types
  if (error.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists'
      }
    });
  }

  if (error.code === '23503') {
    // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced resource does not exist'
      }
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: customMessage || 'Internal server error'
    }
  });
};
```

## Database Service Layer

### User Service
```javascript
// services/userService.js
import db from '../db/knex.js';
import bcrypt from 'bcryptjs';

export const userService = {
  async findById(id) {
    return await db('users')
      .where('id', id)
      .first();
  },

  async findByEmail(email) {
    return await db('users')
      .where('email', email)
      .first();
  },

  async create(userData) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    const [user] = await db('users')
      .insert({
        username: userData.username,
        email: userData.email,
        password_hash: passwordHash,
        display_name: userData.displayName
      })
      .returning(['id', 'username', 'email', 'display_name', 'created_at']);

    return user;
  },

  async updateProfile(id, updateData) {
    const [user] = await db('users')
      .where('id', id)
      .update({
        display_name: updateData.displayName,
        bio: updateData.bio,
        avatar_url: updateData.avatarUrl,
        updated_at: new Date()
      })
      .returning(['id', 'username', 'email', 'display_name', 'bio', 'avatar_url']);

    return user;
  }
};
```

### Thread Service
```javascript
// services/threadService.js
import db from '../db/knex.js';

export const threadService = {
  async findBySpace(spaceId, options = {}) {
    const { page = 1, limit = 20, sort = 'newest' } = options;
    const offset = (page - 1) * limit;

    let query = db('threads')
      .where('space_id', spaceId)
      .select([
        'threads.*',
        'users.username',
        'users.display_name',
        'users.avatar_url as user_avatar_url'
      ])
      .leftJoin('users', 'threads.author_id', 'users.id')
      .limit(limit)
      .offset(offset);

    // Apply sorting
    switch (sort) {
      case 'popular':
        query = query.orderBy('upvote_count', 'desc');
        break;
      case 'oldest':
        query = query.orderBy('created_at', 'asc');
        break;
      default: // newest
        query = query.orderBy('is_pinned', 'desc')
                     .orderBy('created_at', 'desc');
    }

    const threads = await query;

    // Get user votes for each thread if user is authenticated
    if (options.userId) {
      const threadIds = threads.map(t => t.id);
      const votes = await db('votes')
        .where('user_id', options.userId)
        .whereIn('target_id', threadIds)
        .where('target_type', 'thread');

      const voteMap = votes.reduce((acc, vote) => {
        acc[vote.target_id] = vote.vote_type;
        return acc;
      }, {});

      threads.forEach(thread => {
        thread.userVote = voteMap[thread.id] || null;
      });
    }

    return threads;
  },

  async create(threadData) {
    const [thread] = await db('threads')
      .insert({
        title: threadData.title,
        content: threadData.content,
        author_id: threadData.authorId,
        space_id: threadData.spaceId,
        image_url: threadData.imageUrl
      })
      .returning('*');

    // Update space member count
    await db('spaces')
      .where('id', threadData.spaceId)
      .increment('thread_count', 1);

    return thread;
  },

  async findById(id, userId = null) {
    const thread = await db('threads')
      .where('threads.id', id)
      .select([
        'threads.*',
        'users.username',
        'users.display_name',
        'users.avatar_url as user_avatar_url',
        'spaces.name as space_name'
      ])
      .leftJoin('users', 'threads.author_id', 'users.id')
      .leftJoin('spaces', 'threads.space_id', 'spaces.id')
      .first();

    if (!thread) return null;

    // Get user vote if authenticated
    if (userId) {
      const vote = await db('votes')
        .where('user_id', userId)
        .where('target_id', id)
        .where('target_type', 'thread')
        .first();

      thread.userVote = vote ? vote.vote_type : null;
    }

    return thread;
  }
};
```

## File Upload Architecture

### Cloudinary Integration
```javascript
// routes/cloudinary.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'threadly',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    max_file_size: 5 * 1024 * 1024, // 5MB
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      return `${timestamp}_${randomString}`;
    }
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// POST /api/upload
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    res.json({
      success: true,
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        format: req.file.format
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload file'
      }
    });
  }
});

// DELETE /api/upload/:publicId
router.delete('/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;

    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete file'
      }
    });
  }
});

export { router as cloudinaryRoutes };
```

## Environment Configuration

### Environment Variables
```javascript
// config/config.js
export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'threadly_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
};
```

## Security Architecture

### Security Headers
```javascript
// middleware/security.js
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
```

### Rate Limiting
```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});
```

## Deployment

### Production Environment
- **Platform**: Render (Node.js service)
- **Database**: Neon (managed PostgreSQL)
- **Environment Variables**: Configured via Render dashboard
- **Process Management**: Render's built-in process management
- **Health Checks**: Configured health endpoint for monitoring

### Development Environment
- **Local Development**: Node.js with nodemon for hot reload
- **Database**: Local PostgreSQL or Neon development branch
- **Environment**: Local .env files for development configuration

### Database Configuration
- **Production**: Neon PostgreSQL with connection pooling
- **Migrations**: Knex.js migrations run on deployment
- **Backups**: Automated backups handled by Neon
- **Connection**: Secure TLS connections to database

This backend architecture provides a scalable, secure foundation for the Space platform's API services.
