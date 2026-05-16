# Profile Page Implementation Documentation

## Overview

This document outlines the implementation of a modern Reddit-style user profile page for the Threadly application. The profile system includes user information display, activity tracking, follow functionality, and comprehensive API endpoints.

## Features Implemented

### 1. User Profile Display
- **Profile Header**: Avatar, username, bio, and follow button
- **Statistics**: Posts count, comments count, followers count
- **EXP & Level System**: Visual progress bar with level titles
- **Active Spaces**: List of spaces the user is member of
- **Account Information**: Join date and username

### 2. Follow System
- **Follow/Unfollow**: Toggle follow status with real-time updates
- **Follow Status**: Check if current user is following another user
- **Followers/Following Lists**: Paginated lists of followers and following users
- **Follow Counts**: Real-time follower count updates

### 3. User Activity Display
- **Comments Tab**: User's comments with thread context and navigation
- **Posts Tab**: User's created threads with voting and navigation
- **About Tab**: Detailed user information and statistics
- **Infinite Scroll**: Lazy loading for comments and posts

### 4. Modern UI Design
- **Reddit-inspired Layout**: Sidebar with profile info, main content area
- **Material-UI Theme**: Consistent with application design
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Skeleton loaders and loading indicators

## Database Schema

### User Follows Table
```sql
CREATE TABLE user_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

### Existing Tables Used
- `users`: Basic user information, EXP points, level
- `comments`: User comments with thread references
- `threads`: User-created threads
- `spaces`: Space information
- `space_members`: User-space relationships

## API Endpoints

### User Profile Routes (`/api/users/:username`)

#### GET `/api/users/:username`
**Description**: Get user profile data and statistics
**Authentication**: Optional
**Response**:
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "username": "john_doe",
    "bio": "User bio text",
    "avatarUrl": "https://example.com/avatar.jpg",
    "expPoints": 150,
    "level": 2,
    "createdAt": "2024-01-01T00:00:00Z",
    "stats": {
      "threadsCount": 10,
      "commentsCount": 25,
      "followersCount": 5,
      "followingCount": 8
    },
    "isFollowing": false,
    "spaces": [
      {
        "id": 1,
        "name": "General Discussion",
        "description": "General space",
        "role": "member",
        "joinedAt": "2 months ago"
      }
    ]
  }
}
```

#### GET `/api/users/:username/comments`
**Description**: Get user's comments with pagination
**Authentication**: Optional
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "comments": [
    {
      "id": 1,
      "content": "Comment text",
      "timestamp": "2 hours ago",
      "netScore": 5,
      "userVote": 1,
      "thread": {
        "id": 1,
        "title": "Thread title",
        "spaceId": 1,
        "spaceName": "Space name"
      }
    }
  ],
  "hasMore": true,
  "currentPage": 1
}
```

#### GET `/api/users/:username/threads`
**Description**: Get user's threads with pagination
**Authentication**: Optional
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Follow System Routes (`/api/follow/:userId`)

#### POST `/api/follow/:userId`
**Description**: Follow a user
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "result": {
    "isFollowing": true,
    "followersCount": 6
  }
}
```

#### DELETE `/api/follow/:userId`
**Description**: Unfollow a user
**Authentication**: Required

#### GET `/api/follow/:userId/status`
**Description**: Get follow status between users
**Authentication**: Required

#### GET `/api/follow/:userId/followers`
**Description**: Get user's followers list
**Authentication**: Optional
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### GET `/api/follow/:userId/following`
**Description**: Get user's following list
**Authentication**: Optional
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

## Frontend Components

### Profile Page (`src/pages/Profile.jsx`)
**Purpose**: Main profile page component with tab navigation
**Features**:
- Tab-based navigation (About, Comments, Posts)
- Data fetching and state management
- Responsive layout with sidebar and main content
- Loading states and error handling

### FollowButton (`src/components/Profile/FollowButton.jsx`)
**Purpose**: Follow/unfollow button with state management
**Features**:
- Toggle follow status
- Real-time follower count updates
- Loading states during API calls

### ExpBar (`src/components/Profile/ExpBar.jsx`)
**Purpose**: Display user EXP and level progress
**Features**:
- Visual progress bar
- Level titles based on EXP thresholds
- EXP to next level calculation

### ProfileComments (`src/components/Profile/ProfileComments.jsx`)
**Purpose**: Display user's comments with thread context
**Features**:
- Thread navigation
- Voting functionality
- Infinite scroll loading
- Comment dividers for visual separation

### ProfileThreads (`src/components/Profile/ProfileThreads.jsx`)
**Purpose**: Display user's created threads
**Features**:
- Thread navigation
- Voting functionality
- Content preview
- Infinite scroll loading

### ProfileAbout (`src/components/Profile/ProfileAbout.jsx`)
**Purpose**: Detailed user information display
**Features**:
- User statistics grid
- Account information
- Active spaces list
- Level and EXP details

## Routing

### Profile Route
**Path**: `/profile/:username`
**Component**: `Profile`
**Authentication**: Required (protected route)
**Access**: Public profiles, authentication only for follow functionality

## EXP System Integration

The profile page integrates with the existing EXP system:

### Level Thresholds
- Level 1: 0 EXP (Newbie)
- Level 2: 50 EXP (Explorer)
- Level 3: 120 EXP (Contributor)
- Level 4: 220 EXP (Advocate)
- Level 5: 350 EXP (Engager)
- Level 6: 500 EXP (Collaborator)
- Level 7: 700 EXP (Influencer)
- Level 8: 950 EXP (Mentor)
- Level 9: 1250 EXP (Leader)
- Level 10: 1600 EXP (Pioneer)
- Level 11: 2000 EXP (Visionary)
- Level 12: 2450 EXP (Luminary)
- Level 13: 2950 EXP (Sage)
- Level 14: 3500 EXP (Master)
- Level 15: 4100 EXP (Grandmaster)

### Progress Calculation
- Current level EXP: Previous level threshold
- Next level EXP: Current level threshold
- Progress: (currentEXP - previousThreshold) / (currentThreshold - previousThreshold)

## Testing

### Backend Tests (`backend/tests/profile.test.js`)
**Coverage**:
- User profile data retrieval
- Comments and threads pagination
- Follow/unfollow operations
- Follow status checking
- Followers/following lists
- Error handling for edge cases

### Test Cases
- Valid user profile retrieval
- Non-existent user handling
- Pagination functionality
- Follow/unfollow success and failure cases
- Self-follow prevention
- Duplicate follow prevention
- Authentication requirements

## Performance Considerations

### Database Optimization
- Indexes on user_follows table (follower_id, following_id)
- Efficient JOIN queries for comments and threads
- Pagination to limit data transfer
- Optimized user statistics queries

### Frontend Optimization
- Component memoization with useCallback
- Lazy loading with infinite scroll
- Skeleton loaders for better UX
- Efficient state management

### API Optimization
- Pagination for large datasets
- Selective field queries
- Proper error handling
- Response size optimization

## Security Considerations

### Authentication
- Follow operations require authentication
- Profile viewing is public
- Token validation for protected routes

### Data Validation
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- Proper error messages without sensitive information

### Privacy
- Public profile information
- Follow relationships are public
- No sensitive data exposure

## Future Enhancements

### Potential Features
- Profile customization options
- Profile picture upload
- Achievement badges
- Activity timeline
- Private profiles option
- Block/mute functionality
- Profile search
- Profile sharing

### API Extensions
- Profile editing endpoints
- Avatar upload endpoints
- Achievement system
- Activity analytics

## Usage Examples

### Accessing Profile Pages
```
/profile/john_doe
/profile/jane_smith
```

### Follow Operations
```javascript
// Follow a user
POST /api/follow/123

// Unfollow a user
DELETE /api/follow/123

// Check follow status
GET /api/follow/123/status
```

### Profile Data Fetch
```javascript
// Get profile data
GET /api/users/john_doe

// Get user comments
GET /api/users/john_doe/comments?page=1&limit=20

// Get user threads
GET /api/users/john_doe/threads?page=1&limit=20
```

## Troubleshooting

### Common Issues
1. **Profile not loading**: Check username exists in database
2. **Follow button not working**: Verify authentication token
3. **Comments not showing**: Check user has made comments
4. **EXP not displaying**: Verify user has EXP points in database

### Debug Steps
1. Check browser console for errors
2. Verify API responses in network tab
3. Check database records exist
4. Verify authentication status
5. Check API endpoint configurations

## Conclusion

The profile page implementation provides a comprehensive user profile system with modern UI design, robust backend API, and extensive testing coverage. The system integrates seamlessly with existing Threadly features while providing a solid foundation for future enhancements.
