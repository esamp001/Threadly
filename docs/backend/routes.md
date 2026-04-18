# API Routes Specification

## Purpose
This document defines all API routes in the Space platform backend, their endpoints, request/response formats, and business logic.

## Dependencies
- Express.js for routing
- Knex.js for database operations
- Authentication middleware (checkAuth)
- Rate limiting middleware (globalRateLimit, voteRateLimit)

## Comments Routes

### POST /api/comments/vote
**Location**: `backend/src/routes/comments.routes.js`

**Purpose**: Handle comment voting with optimistic UI support

**Authentication**: Required (checkAuth middleware)

**Rate Limiting**: Global rate limit applied (100 requests per 15 minutes per IP)

**Request Body**:
```javascript
{
  commentId: number,      // Comment ID to vote on
  voteType: string        // 'upvote' or 'downvote'
}
```

**Response**:
```javascript
{
  success: boolean,
  updatedComment: {
    id: number,
    content: string,
    thread_id: number,
    parent_id: number | null,
    created_by: number,
    created_at: string,
    updated_at: string,
    upvotes: number,
    downvotes: number,
    net_score: number,
    author: string,
    timestamp: string,
    userVote: number,      // 1, 0, or -1
    user_avatar_url: string
  }
}
```

**Implementation Details**:

**Database Transaction**:
- Uses Knex transaction for atomic operations
- Locks comment row with `forUpdate()` to prevent concurrent modifications

**Vote Logic**:
1. Check if user has existing vote on comment
2. If no existing vote: Insert new vote record
3. If existing vote: Update vote_type to new value
4. Fetch and format updated comment with user's current vote state

**Vote Count Updates**:
- Simplified approach: Only updates vote record, not vote counts
- Frontend handles vote count calculations via optimistic updates
- Backend returns formatted comment with current vote state

**Response Format**:
- Matches GET endpoint format for consistency
- Includes author, timestamp, user_avatar_url fields
- userVote reflects current state (1, 0, or -1)

**Error Handling**:
- Returns 500 on database errors
- Response sent in finally block to ensure always returned

**Integration Notes**:
- Frontend uses debounce approach (500ms delay) to handle spam clicking
- Frontend sends final vote state after debounce period
- No idempotency key system (removed in favor of debounce)
- No vote-specific rate limiting (removed to allow spam clicking)

## Cloudinary Routes

### POST /api/cloudinary/upload
**Location**: `backend/src/routes/cloudinary.js`

**Purpose**: Upload avatar images to Cloudinary

**Authentication**: Required (checkAuth middleware)

**Request Body**: `multipart/form-data` with field name `avatar`

**Response**:
```javascript
{
  status: 'success',
  message: 'Avatar uploaded successfully',
  url: string,              // Cloudinary secure URL
  publicId: string          // Cloudinary public ID
}
```

**Implementation Details**:
- Uses multer memory storage for file handling
- Uploads to `threadly/avatars` folder in Cloudinary
- Public ID format: `space-avatar_${timestamp}`
- Returns secure URL for immediate use

### POST /api/cloudinary/upload_editor_image
**Location**: `backend/src/routes/cloudinary.js`

**Purpose**: Upload Quill editor images to Cloudinary

**Authentication**: Required (checkAuth middleware)

**Request Body**: `multipart/form-data` with field name `image`

**Response**:
```javascript
{
  status: 'success',
  message: 'Image uploaded successfully',
  url: string              // Cloudinary secure URL
}
```

**Implementation Details**:
- Used for post-processing images from Quill editor content
- Frontend extracts base64 images from content, uploads them, and replaces with Cloudinary URLs
- Uploads to `threadly/editor_images` folder in Cloudinary
- Public ID format: `editor_image_${timestamp}`
- Called when user clicks "Create Thread" to process all images in content

**Integration Notes**:
- Images stored as Cloudinary URLs instead of base64 to avoid database bloat
- Text content stored as HTML in database
- Final content contains both text (HTML) and images (Cloudinary URLs)
- Provides CDN benefits and faster image loading

## Other Routes

*Additional routes will be documented as they are implemented.*
