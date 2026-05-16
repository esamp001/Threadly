# API Specification

## Purpose
This document defines the complete RESTful API specification for the Space platform, including all endpoints, request/response formats, and authentication requirements.

## API Overview
- **Base URL**: `http://localhost:3001/api` (development)
- **Protocol**: HTTP/HTTPS
- **Data Format**: JSON
- **Authentication**: JWT Bearer Token
- **API Version**: v1

## Authentication

### JWT Token Format
```json
{
  "userId": 123,
  "username": "john_doe",
  "email": "john@example.com",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Authorization Header
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "avatarUrl": null,
      "isOnboarded": false,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### POST /api/auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "avatarUrl": null,
      "isOnboarded": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### POST /api/auth/logout
Invalidate user session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "bio": "Software developer",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isOnboarded": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## User Management Endpoints

### PUT /api/users/profile
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "displayName": "John Smith",
  "bio": "Updated bio",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "john_doe",
      "displayName": "John Smith",
      "bio": "Updated bio",
      "avatarUrl": "https://example.com/new-avatar.jpg"
    }
  },
  "message": "Profile updated successfully"
}
```

## Space Management Endpoints

### GET /api/spaces
Get list of spaces with pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `search` (string, optional): Search term for space names

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spaces": [
      {
        "id": 1,
        "name": "Web Development",
        "description": "Discuss web development topics",
        "avatarUrl": "https://example.com/space-avatar.jpg",
        "memberCount": 1500,
        "isPrivate": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### POST /api/spaces
Create a new space.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Machine Learning",
  "description": "Discuss ML algorithms and applications",
  "isPrivate": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "space": {
      "id": 2,
      "name": "Machine Learning",
      "description": "Discuss ML algorithms and applications",
      "avatarUrl": null,
      "creatorId": 123,
      "isPrivate": false,
      "memberCount": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Space created successfully"
}
```

### GET /api/spaces/:id
Get space details by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "space": {
      "id": 1,
      "name": "Web Development",
      "description": "Discuss web development topics",
      "avatarUrl": "https://example.com/space-avatar.jpg",
      "coverImageUrl": "https://example.com/cover.jpg",
      "creatorId": 123,
      "isPrivate": false,
      "memberCount": 1500,
      "createdAt": "2024-01-01T00:00:00Z",
      "creator": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    }
  }
}
```

### POST /api/spaces/:id/join
Join a space.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Joined space successfully"
}
```

### DELETE /api/spaces/:id/leave
Leave a space.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Left space successfully"
}
```

## Thread Management Endpoints

### GET /api/spaces/:spaceId/threads
Get threads in a space.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `sort` (string, optional): Sort by 'newest', 'oldest', 'popular' (default: 'newest')

**Response (200):**
```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": 1,
        "title": "Best practices for React hooks",
        "content": "Let's discuss the best practices...",
        "author": {
          "id": 123,
          "username": "john_doe",
          "displayName": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "spaceId": 1,
        "imageUrl": null,
        "upvoteCount": 25,
        "downvoteCount": 2,
        "commentCount": 15,
        "isPinned": false,
        "isLocked": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "userVote": "upvote"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### POST /api/spaces/:spaceId/threads
Create a new thread.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Understanding async/await in JavaScript",
  "content": "Can someone explain how async/await works...",
  "imageUrl": "https://example.com/thread-image.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "thread": {
      "id": 2,
      "title": "Understanding async/await in JavaScript",
      "content": "Can someone explain how async/await works...",
      "author": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "spaceId": 1,
      "imageUrl": "https://example.com/thread-image.jpg",
      "upvoteCount": 0,
      "downvoteCount": 0,
      "commentCount": 0,
      "isPinned": false,
      "isLocked": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Thread created successfully"
}
```

### GET /api/threads/:id
Get thread details with comments.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "thread": {
      "id": 1,
      "title": "Best practices for React hooks",
      "content": "Let's discuss the best practices...",
      "author": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "space": {
        "id": 1,
        "name": "Web Development"
      },
      "imageUrl": null,
      "upvoteCount": 25,
      "downvoteCount": 2,
      "commentCount": 15,
      "isPinned": false,
      "isLocked": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "userVote": "upvote",
      "comments": [
        {
          "id": 1,
          "content": "Great question! Here are my thoughts...",
          "author": {
            "id": 124,
            "username": "jane_smith",
            "displayName": "Jane Smith",
            "avatarUrl": "https://example.com/avatar2.jpg"
          },
          "parentCommentId": null,
          "upvoteCount": 5,
          "downvoteCount": 0,
          "isEdited": false,
          "createdAt": "2024-01-01T01:00:00Z",
          "userVote": null,
          "replies": []
        }
      ]
    }
  }
}
```

## Comment Endpoints

### POST /api/threads/:threadId/comments
Add a comment to a thread.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "content": "This is a great point! I would also add...",
  "parentCommentId": null
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": 2,
      "content": "This is a great point! I would also add...",
      "author": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "threadId": 1,
      "parentCommentId": null,
      "upvoteCount": 0,
      "downvoteCount": 0,
      "isEdited": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Comment added successfully"
}
```

### PUT /api/comments/:id
Edit a comment.

**Headers:** `Authorization: Bearer <token>`

**Permission Requirements:**
- Only the comment author can edit their own comment
- Edit must be within 5 minutes of comment creation
- Returns 403 if time limit exceeded or user is not author

**Request:**
```json
{
  "content": "Updated comment content"
}
```

**Response (200):**
```json
{
  "success": true,
  "status": 200,
  "error_message": "",
  "comment": {
    "id": 1,
    "content": "Updated comment content",
    "thread_id": 1,
    "parent_id": null,
    "created_by": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:05:00Z",
    "username": "john_doe",
    "user_avatar_url": "https://example.com/avatar.jpg"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "status": 403,
  "error_message": "Edit time limit exceeded (5 minutes)"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "status": 403,
  "error_message": "Not the comment author"
}
```

### DELETE /api/comments/:id
Soft delete a comment.

**Headers:** `Authorization: Bearer <token>`

**Permission Requirements:**
- Comment author can delete their own comment
- Space moderators and admins can delete any comment in their space
- Regular members cannot delete others' comments

**Behavior:**
- Performs a soft delete (sets `is_active` to false)
- Records `deleted_at` timestamp
- Records `deleted_by` user ID
- Comment remains visible with message "This comment is deleted by user"
- Replies to deleted comments remain visible

**Response (200):**
```json
{
  "success": true,
  "status": 200,
  "error_message": ""
}
```

**Error Response (403):**
```json
{
  "success": false,
  "status": 403,
  "error_message": "Not authorized to delete this comment"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "status": 404,
  "error_message": "Comment not found"
}
```

## Voting Endpoints

### POST /api/threads/:id/vote
Vote on a thread.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "voteType": "upvote"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upvoteCount": 26,
    "downvoteCount": 2,
    "userVote": "upvote"
  },
  "message": "Vote recorded successfully"
}
```

### POST /api/comments/:id/vote
Vote on a comment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "voteType": "downvote"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upvoteCount": 5,
    "downvoteCount": 1,
    "userVote": "downvote"
  },
  "message": "Vote recorded successfully"
}
```

## File Upload Endpoints

### POST /api/upload
Upload an image file.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Request Body:**
- `image` (file): Image file to upload

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/example/image/upload/v1234567890/image.jpg",
    "publicId": "example/image_v1234567890"
  },
  "message": "File uploaded successfully"
}
```

## Notification Endpoints

### GET /api/notifications
Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `unreadOnly` (boolean, optional): Get only unread notifications

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "new_comment",
        "title": "New comment on your thread",
        "message": "John Doe commented on your thread",
        "data": {
          "threadId": 1,
          "commentId": 5,
          "authorId": 124
        },
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    },
    "unreadCount": 5
  }
}
```

### PUT /api/notifications/:id/read
Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Error Codes

### Authentication Errors
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Invalid token
- `AUTH_004` - User not found

### Validation Errors
- `VALIDATION_001` - Required field missing
- `VALIDATION_002` - Invalid email format
- `VALIDATION_003` - Password too weak
- `VALIDATION_004` - Username already taken

### Resource Errors
- `RESOURCE_001` - Resource not found
- `RESOURCE_002` - Access denied
- `RESOURCE_003` - Resource already exists
- `RESOURCE_004` - Resource locked

### System Errors
- `SYSTEM_001` - Internal server error
- `SYSTEM_002` - Database error
- `SYSTEM_003` - External service error
- `SYSTEM_004` - Rate limit exceeded

## Rate Limiting

### Limits
- Authentication endpoints: 5 requests per minute
- Content creation: 10 requests per minute
- File uploads: 3 requests per minute
- General endpoints: 100 requests per minute

### Headers
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

This API specification provides a comprehensive interface for the Space platform's social features.
