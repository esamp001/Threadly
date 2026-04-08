# Database Layer Specification

## Purpose
This document defines the database architecture, migration patterns, and database operations for the Space platform backend using Knex.js and PostgreSQL.

## Database Configuration

### Knex.js Setup
**Location**: `backend/knexfile.js`

```javascript
const dotenv = require('dotenv');

// Auto-detect environment and load appropriate .env file
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: './src/db/migrations',
  },
  seeds: {
    directory: './src/db/seeds',
  },
};
```

### Environment Configuration
- **Development**: `.env.development`
- **Production**: `.env.production`
- **Test**: `.env.test`

### Connection Variables
- `DATABASE_URL`: Full connection string (optional)
- `DB_HOST`: Database host
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

## Migration System

### Migration Format
All migrations follow this consistent format:

```javascript
// Migration: YYYYMMDDHHMMSS_description.js
module.exports.up = async (knex) => {
  // Migration logic
};

module.exports.down = async (knex) => {
  // Rollback logic
};
```

### Migration Commands
```bash
# Run latest migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Run seed files
npm run seed
```

## Database Schema

### Core Tables

#### users
**Migration**: `20260314030220_create_user_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();

    // Firebase integration
    table.string('firebase_uid').unique().nullable();

    // Basic user info
    table.string('email').unique().notNullable();
    table.string('username').unique().nullable();
    table.string('password').nullable(); // For future email/password auth

    // Profile
    table.text('bio').nullable();
    table.string('avatar_url').nullable();

    // Status
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('email');
    table.index('firebase_uid');
    table.index('username');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('users');
};
```

**Additional User Fields**:
- `avatar_seed` - Avatar generation seed (`20260315073917_add_avatar_fields_to_users.js`)
- `avatar_options` - Avatar generation options JSON (`20260315073917_add_avatar_fields_to_users.js`)
- `gender` - User gender (`20260315021015_add_gender_to_users.js`)
- `is_onboarded` - Onboarding completion status (`20260328120346_add_is_onboarded_to_users.js`)

#### spaces
**Migration**: `20260221133337_create_spaces_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('spaces', (table) => {
    table.increments('id').primary();
    table.string('space_name').notNullable();
    table.text('space_description');
    table.string('space_slug').unique().notNullable();
    table.string('avatar_url');
    table.string('avatar_public_id');
    table.enu('community_type', ['public', 'restricted', 'private']).defaultTo('public');
    table.boolean('is_mature').defaultTo(false);
    table.integer('created_by').unsigned().notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('space_slug');
    table.index('created_by');
    table.index('community_type');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('spaces');
};
```

#### threads
**Migration**: `20260227161437_create_table_for_threads.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('threads', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('content').notNullable();

    table.integer('space_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('spaces')
      .onDelete('CASCADE');

    table.integer('created_by').unsigned().notNullable();

    // Cached score fields for performance
    table.integer('upvotes').defaultTo(0);
    table.integer('downvotes').defaultTo(0);
    table.integer('net_score').defaultTo(0);
    table.integer('comments').defaultTo(0);
    table.integer('shares').defaultTo(0);

    table.boolean('is_active').defaultTo(true);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('space_id');
    table.index('created_by');
    table.index('net_score'); // for sorting by top
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('threads');
};
```

#### comments
**Migration**: `20260308140500_create_comments_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();

    table.text('content').notNullable();

    table.integer('thread_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('threads')
      .onDelete('CASCADE');

    table.integer('parent_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('comments')
      .onDelete('CASCADE');

    table.integer('created_by').unsigned().defaultTo(1); // Default user for now

    // Cached score fields
    table.integer('upvotes').defaultTo(0);
    table.integer('downvotes').defaultTo(0);
    table.integer('net_score').defaultTo(0);

    table.boolean('is_active').defaultTo(true);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('thread_id');
    table.index('parent_id');
    table.index('net_score');
  });
};

module.exports.down = async (knex) => {
  // Check if table exists before dropping
  const hasCommentsTable = await knex.schema.hasTable('comments');
  if (hasCommentsTable) {
    await knex.schema.dropTable('comments');
  }
};
```

### Voting System

#### scores (Thread Votes)
**Migration**: `20260309000402_recreate_scores_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('scores', (table) => {
    table.increments('id').primary();

    table.integer('user_id').notNullable();

    table.integer('thread_id')
      .unsigned()
      .references('id')
      .inTable('threads')
      .onDelete('CASCADE');

    table.integer('vote_type').notNullable(); // 1 for upvote, -1 for downvote

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Ensure one vote per user per thread
    table.unique(['user_id', 'thread_id']);

    // Indexes
    table.index('thread_id');
    table.index('user_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('scores');
};
```

#### comment_votes
**Migration**: `20260322093521_create_comment_votes.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('comment_votes', (table) => {
    table.increments('id').primary();

    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');

    table.integer('comment_id').unsigned().notNullable()
      .references('id').inTable('comments').onDelete('CASCADE');

    table.integer('vote_type').notNullable(); // 1 for upvote, -1 for downvote
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Ensure one vote per user per comment
    table.unique(['comment_id', 'user_id']);

    // Indexes
    table.index('comment_id');
    table.index('user_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('comment_votes');
};
```

### Topic System

#### topics
**Migration**: `20260215105420_create_topics_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('topics', (table) => {
    table.increments('id').primary();       // Auto-incrementing ID
    table.string('name').notNullable();     // Topic name
    table.string('slug').notNullable().unique(); // URL-friendly identifier
    table.text('description');              // Optional description
    table.string('icon');                   // Optional icon (e.g., Remix Icon class)
    table.timestamps(true, true);           // created_at & updated_at
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('topics');
};
```

#### space_topics
**Migration**: `20260221133521_create_space_topics_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('space_topics', (table) => {
    table.increments('id').primary();
    table.integer('space_id').unsigned().notNullable();
    table.integer('topic_id').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign key constraints
    table.foreign('space_id').references('id').inTable('spaces').onDelete('CASCADE');
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');

    // Prevent duplicate space-topic relationships
    table.unique(['space_id', 'topic_id']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('space_topics');
};
```

#### user_topics
**Migration**: `20260315073108_create_user_topics_table.js`

```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('user_topics', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('topic_id').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');

    // Ensure unique combination
    table.unique(['user_id', 'topic_id']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('user_topics');
};
```

## Migration Patterns

### Table Creation Pattern
```javascript
module.exports.up = async (knex) => {
  await knex.schema.createTable('table_name', (table) => {
    // Primary key
    table.increments('id').primary();
    
    // Columns with proper types and constraints
    table.string('field').notNullable();
    table.text('description').nullable();
    table.integer('count').defaultTo(0);
    table.boolean('active').defaultTo(true);
    table.enu('type', ['option1', 'option2']).defaultTo('option1');
    
    // Foreign keys
    table.integer('foreign_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('other_table')
      .onDelete('CASCADE');
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('field');
    table.unique(['field1', 'field2']);
  });
};
```

### Table Modification Pattern
```javascript
// Adding columns
exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('new_field').nullable();
    table.text('json_field').nullable(); // JSON string
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('new_field');
    table.dropColumn('json_field');
  });
};
```

### Foreign Key Update Pattern
```javascript
module.exports.up = async (knex) => {
  await knex.schema.table('comments', (table) => {
    table.integer('created_by').nullable().alter().defaultTo(null);
  });
  
  await knex.schema.raw(`
    ALTER TABLE comments 
    ADD CONSTRAINT comments_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  `);
};

module.exports.down = async (knex) => {
  await knex.schema.table('comments', (table) => {
    table.dropForeign('created_by');
  });
};
```

## Database Operations

### Connection Setup
```javascript
// src/db/knex.js
const knex = require('knex');
const knexfile = require('../../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

module.exports = knex(config);
```

### Query Patterns

#### Basic Queries
```javascript
const db = require('./src/db/knex');

// Select
const users = await db('users').where('is_active', true);
const user = await db('users').where('id', userId).first();

// Insert
const [newUser] = await db('users').insert(userData).returning('*');

// Update
const updated = await db('users')
  .where('id', userId)
  .update(updateData);

// Delete
await db('users').where('id', userId).del();
```

#### Complex Queries
```javascript
// Join with pagination
const threads = await db('threads')
  .select('threads.*', 'users.username', 'spaces.space_name')
  .join('users', 'threads.created_by', 'users.id')
  .join('spaces', 'threads.space_id', 'spaces.id')
  .where('threads.is_active', true)
  .orderBy('threads.net_score', 'desc')
  .limit(10)
  .offset(page * 10);

// Aggregation
const stats = await db('threads')
  .count('* as total')
  .sum('upvotes as total_upvotes')
  .where('space_id', spaceId)
  .first();
```

#### Transaction Pattern
**Always use transactions for multiple operations** to ensure data consistency and atomicity.

```javascript
await db.transaction(async (trx) => {
  // Create thread
  const [thread] = await trx('threads').insert(threadData).returning('*');
  
  // Update space thread count
  await trx('spaces')
    .where('id', threadData.space_id)
    .increment('thread_count', 1);
    
  return thread;
});
```

**Transaction Guidelines**:
- Use transactions for any operation involving multiple table modifications
- Ensures all operations succeed or fail together (atomicity)
- Prevents data corruption and inconsistent states
- Automatically rolls back on any failure

## Index Strategy

### Performance Indexes
- **Foreign Keys**: All foreign key columns indexed
- **Search Fields**: Commonly queried columns (email, username, space_slug)
- **Sorting**: net_score for thread ordering
- **Unique Constraints**: Composite indexes for uniqueness

### Index Creation Pattern
```javascript
// Single column
table.index('column_name');

// Composite
table.index(['column1', 'column2']);

// Unique
table.unique(['column1', 'column2']);
```

## Data Integrity

### Foreign Key Constraints
- **CASCADE DELETE**: Automatically remove related records
- **RESTRICT**: Prevent deletion of referenced records
- **SET NULL**: Set foreign key to null on deletion

### Validation Constraints
- **NOT NULL**: Required fields
- **UNIQUE**: Unique values
- **ENUM**: Limited value sets
- **DEFAULT**: Default values

## Migration Best Practices

### File Naming
- Format: `YYYYMMDDHHMMSS_description.js`
- Use descriptive names
- Chronological order

### Code Style
- Use `async/await` for all operations
- Include proper rollback logic
- Add comments for complex logic
- Use consistent formatting

### Safety Checks
```javascript
// Check table exists before dropping
module.exports.down = async (knex) => {
  const hasTable = await knex.schema.hasTable('table_name');
  if (hasTable) {
    await knex.schema.dropTable('table_name');
  }
};
```

### Error Handling
```javascript
try {
  await knex.schema.createTable('table_name', (table) => {
    // Table definition
  });
} catch (error) {
  console.error('Migration failed:', error);
  throw error;
}
```

## Seed Data

### Seed File Structure
```javascript
// src/db/seeds/001_topics.js
exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('topics').del();
  
  // Inserts seed entries
  await knex('topics').insert([
    { name: 'Technology', slug: 'technology', icon: 'ri-code-line' },
    { name: 'Design', slug: 'design', icon: 'ri-palette-line' },
    // ... more topics
  ]);
};
```

## Performance Considerations

### Query Optimization
- Use appropriate indexes
- Limit result sets with pagination
- Use LEFT JOIN if needed, otherwise use INNER JOIN
  - **Use LEFT JOIN** when you need to preserve all records from the primary table, even if there are no matches in the joined table
  - **Use INNER JOIN** when you only want records that have matches in both tables (more efficient when appropriate)
- Cache frequently accessed data

### Connection Pooling
- Configure pool size in knexfile
- Monitor connection usage
- Handle connection timeouts

### Backup Strategy
- Regular database backups
- Migration version tracking
- Rollback procedures

This database layer provides a robust, scalable foundation for the Space platform with proper migration management, indexing strategies, and data integrity guarantees.
