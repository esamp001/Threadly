# Search Feature Documentation

## Purpose

This document provides comprehensive documentation for the search functionality in the Space platform, including backend API endpoints, frontend implementation, search behavior, and technical details.

## Overview

The search feature allows users to discover spaces and threads through text-based queries. The search is case-insensitive and supports pagination for efficient data retrieval.

### Search Types

1. **Spaces Search** - Search for communities by name and description
2. **Threads Search** - Search for discussions by title and content (requires authentication)

### Key Features

- **Case-insensitive search** - Uses PostgreSQL's `ilike` operator for case-insensitive matching
- **Pagination** - Supports page-based pagination with configurable limit
- **Infinite scroll** - Frontend implements infinite scroll for seamless browsing
- **Recent searches** - Stores and displays recent search queries for quick access
- **Popular spaces** - Shows popular spaces in search dropdown

## Backend API Endpoints

### GET /api/search/spaces

Search for spaces by name and description.

**Authentication**: Not required

**Query Parameters**:
- `search` (string, optional): Search term to match against space_name and space_description
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of results per page (default: 10)

**Request Example**:
```bash
GET /api/search/spaces?search=momo&page=1&limit=10
```

**Response (200)**:
```json
{
  "success": true,
  "spaces": [
    {
      "id": 40,
      "space_name": "momo",
      "avatar_url": "https://res.cloudinary.com/dldbwfelw/image/upload/v1776577997/threadly/avatars/space-avatar-1776577993460.jpg",
      "member_count": 1,
      "space_description": "zcs123"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalCount": "1",
    "hasMore": false,
    "totalPages": 1
  }
}
```

**Response (500)**:
```json
{
  "success": false,
  "message": "Error message"
}
```

**Search Behavior**:
- Searches both `space_name` and `space_description` fields
- Only returns spaces where `is_active = true`
- Results ordered by `member_count` in descending order
- Case-insensitive matching using PostgreSQL `ilike` operator

### GET /api/search/threads

Search for threads by title and content.

**Authentication**: Required (JWT Bearer Token)

**Query Parameters**:
- `search` (string, optional): Search term to match against thread title and content
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of results per page (default: 10)

**Request Example**:
```bash
GET /api/search/threads?search=react&page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response (200)**:
```json
{
  "success": true,
  "threads": [
    {
      "id": 1,
      "title": "Best practices for React hooks",
      "content": "Let's discuss the best practices...",
      "space_id": 1,
      "created_by": 123,
      "username": "john_doe",
      "user_avatar_url": "https://example.com/avatar.jpg",
      "space_name": "Web Development",
      "space_avatar_url": "https://example.com/space-avatar.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "upvotes": 25,
      "shares": 5,
      "net_score": 25,
      "userVote": "upvote",
      "comment_count": 15,
      "timeAgo": "2 hours ago",
      "comments": 15
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalCount": "50",
    "hasMore": true,
    "totalPages": 5
  }
}
```

**Response (401)**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Search Behavior**:
- Searches both `title` and `content` fields in threads table
- Only returns threads from active spaces
- Results ordered by `created_at` in descending order (newest first)
- Includes user vote information for authenticated users
- Case-insensitive matching using PostgreSQL `ilike` operator
- Joins with spaces, users, scores, and comments tables for complete data

## Frontend Implementation

### Search Page Component

**Location**: `src/pages/Search.jsx`

**Features**:
- Tab-based interface for switching between Spaces and Threads search
- Infinite scroll using Intersection Observer API
- Skeleton loading states
- Empty state handling
- Pagination support

**State Management**:
```javascript
const [tabValue, setTabValue] = useState(0); // 0 = Spaces, 1 = Threads
const [spaces, setSpaces] = useState([]);
const [threads, setThreads] = useState([]);
const [loading, setLoading] = useState(false);
const [spacesPage, setSpacesPage] = useState(1);
const [threadsPage, setThreadsPage] = useState(1);
const [spacesHasMore, setSpacesHasMore] = useState(true);
const [threadsHasMore, setThreadsHasMore] = useState(true);
```

**API Integration**:
```javascript
const fetchSpaces = useCallback(async (loadMore = false) => {
  if (loading || !spacesHasMore || !searchQuery) return;

  const currentPage = loadMore ? spacesPage + 1 : 1;
  try {
    setLoading(true);
    const response = await apiRequest(`/api/search/spaces?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${limit}`);
    const result = await response.json();

    if (result.success) {
      if (loadMore) {
        setSpaces(prev => [...prev, ...result.spaces]);
        setSpacesPage(currentPage);
      } else {
        setSpaces(result.spaces);
        setSpacesPage(1);
      }
      setSpacesHasMore(result.pagination.hasMore);
    }
  } catch (error) {
    console.error('Failed to fetch spaces:', error);
  } finally {
    setLoading(false);
  }
}, [searchQuery, loading, spacesHasMore, spacesPage, limit]);
```

### Search Dropdown Component

**Location**: `src/components/HomeComponents/SearchDropdown.jsx`

**Features**:
- Displays recent searches from localStorage
- Shows popular spaces
- Filters results based on search input
- Click-to-search functionality

**Recent Searches**:
- Stored in localStorage
- Managed by `src/utils/searchHelpers.js`
- Functions: `addRecentSearch`, `getRecentSearches`, `removeRecentSearch`, `clearRecentSearches`

### Header Search Integration

**Location**: `src/components/HomeComponents/Header.jsx`

**Features**:
- Search input in header
- Opens search dropdown on click
- Navigates to search page on Enter key
- Adds search to recent searches

## Search Behavior

### Case-Insensitive Matching

The search uses PostgreSQL's `ilike` operator for case-insensitive pattern matching:

```javascript
// Backend implementation
query.where(function() {
  this.where('space_name', 'ilike', `%${search}%`)
    .orWhere('space_description', 'ilike', `%${search}%`);
});
```

**Examples**:
- Search "momo" matches "Momo", "MOMO", "momo"
- Search "react" matches "React", "REACT", "react"
- Search "web development" matches "Web Development", "web development"

### Search Fields

**Spaces Search**:
- `space_name` - The name of the space
- `space_description` - The description of the space

**Threads Search**:
- `title` - The title of the thread
- `content` - The content/body of the thread

### Empty Search Handling

- If no search parameter is provided, returns all active spaces/threads
- Frontend shows "No search query provided" message when URL has no `q` parameter
- Backend treats empty search as "return all" (no WHERE clause applied)

### No Results Handling

- Frontend displays "No spaces found" or "No threads found" message
- Shows skeleton loading state while fetching
- Maintains empty state UI for better UX

## Technical Details

### Database Queries

**Spaces Search Query**:
```javascript
const query = knex('spaces')
  .select('id', 'space_name', 'avatar_url', 'member_count', 'space_description')
  .where('is_active', true);

if (search) {
  query.where(function() {
    this.where('space_name', 'ilike', `%${search}%`)
      .orWhere('space_description', 'ilike', `%${search}%`);
  });
}

const spaces = await query
  .orderBy('member_count', 'desc')
  .limit(limit)
  .offset(offset);
```

**Threads Search Query**:
```javascript
const query = knex('threads')
  .join('spaces', 'threads.space_id', 'spaces.id')
  .leftJoin('users', 'threads.created_by', 'users.id')
  .leftJoin('scores', function () {
    this.on('threads.id', '=', 'scores.thread_id')
      .andOn('scores.user_id', '=', knex.raw('?', [userId]))
  })
  .leftJoin('comments', 'threads.id', 'comments.thread_id')
  .select(/* fields */)
  .count('comments.id as comment_count')
  .groupBy(/* fields */);

if (search) {
  query.where(function() {
    this.where('threads.title', 'ilike', `%${search}%`)
      .orWhere('threads.content', 'ilike', `%${search}%`);
  });
}

const threadsData = await query
  .orderBy('threads.created_at', 'desc')
  .limit(limit)
  .offset(offset);
```

### PostgreSQL ilike Operator

The `ilike` operator performs case-insensitive pattern matching:
- `%` matches any sequence of characters (including empty)
- `_` matches any single character
- Case-insensitive: 'A' matches 'a', 'B' matches 'b', etc.

**Performance Considerations**:
- `ilike` with leading wildcard (`%term`) cannot use standard B-tree indexes
- Consider adding trigram indexes (pg_trgm extension) for better performance on large datasets
- Current implementation is suitable for small to medium datasets

### Indexing Strategy

**Spaces Table**:
- `space_slug` - Unique index for URL routing
- `created_by` - Index for creator queries
- `community_type` - Index for filtering by type
- `is_active` - Should be indexed for search filtering

**Threads Table**:
- `space_id` - Index for space-specific queries
- `created_by` - Index for user-specific queries
- `net_score` - Index for sorting by popularity
- `created_at` - Index for chronological sorting

**Recommended Additional Indexes**:
```sql
-- For better search performance (requires pg_trgm extension)
CREATE INDEX idx_spaces_space_name_trgm ON spaces USING gin (space_name gin_trgm_ops);
CREATE INDEX idx_spaces_space_description_trgm ON spaces USING gin (space_description gin_trgm_ops);
CREATE INDEX idx_threads_title_trgm ON threads USING gin (title gin_trgm_ops);
CREATE INDEX idx_threads_content_trgm ON threads USING gin (content gin_trgm_ops);
```

### API Configuration

**Frontend API Configuration** (`src/config/api.js`):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  return response;
};
```

**Vite Proxy Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## Usage Examples

### API Call Examples

**Search for spaces**:
```bash
# Using curl
curl "http://localhost:3000/api/search/spaces?search=momo&page=1&limit=10"

# Using JavaScript fetch
fetch('http://localhost:3000/api/search/spaces?search=momo&page=1&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Search for threads (authenticated)**:
```bash
# Using curl
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/search/threads?search=react&page=1&limit=10"

# Using JavaScript fetch
fetch('http://localhost:3000/api/search/threads?search=react&page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Frontend Code Snippets

**Navigate to search page**:
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate with search query
navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
```

**Use search helpers**:
```javascript
import { addRecentSearch, getRecentSearches, clearRecentSearches } from '../utils/searchHelpers';

// Add to recent searches
addRecentSearch('react');

// Get recent searches
const recentSearches = getRecentSearches();

// Clear all recent searches
clearRecentSearches();
```

**Implement search with API**:
```javascript
import apiRequest from '../config/api';

const performSearch = async (query, page = 1) => {
  try {
    const response = await apiRequest(`/api/search/spaces?search=${encodeURIComponent(query)}&page=${page}&limit=10`);
    const result = await response.json();
    
    if (result.success) {
      return result.spaces;
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
  return [];
};
```

### Testing Scenarios

**Test Case 1: Basic Space Search**
1. Navigate to `/search?q=momo`
2. Verify spaces tab is selected
3. Verify "momo" space appears in results
4. Verify case-insensitivity (try "Momo", "MOMO")

**Test Case 2: No Results**
1. Navigate to `/search?q=xyz123`
2. Verify "No spaces found" message appears
3. Verify no API errors in console

**Test Case 3: Empty Search**
1. Navigate to `/search` (no query parameter)
2. Verify "No search query provided" message appears

**Test Case 4: Pagination**
1. Navigate to `/search?q=` (empty search to get all spaces)
2. Scroll to bottom of page
3. Verify more spaces load (infinite scroll)
4. Verify loading indicator appears

**Test Case 5: Threads Search (Authenticated)**
1. Log in to the application
2. Navigate to `/search?q=react`
3. Switch to Threads tab
4. Verify threads with "react" in title/content appear
5. Verify user vote information is included

**Test Case 6: Recent Searches**
1. Perform a search for "web development"
2. Click search icon in header
3. Verify "web development" appears in recent searches
4. Click on recent search item
5. Verify navigates to search page with that query

## Troubleshooting

### Common Issues

**Issue: Search returns no results**
- Verify the search term matches space/thread names or descriptions
- Check that spaces have `is_active = true` in database
- Verify backend server is running on port 3000
- Check browser console for API errors

**Issue: Frontend not displaying results**
- Check Network tab in DevTools to verify API call is made
- Verify response contains expected data
- Check for JavaScript errors in console
- Ensure Vite proxy is configured correctly

**Issue: Case-sensitive search**
- Verify backend is using `ilike` operator (not `like`)
- Check PostgreSQL version supports `ilike` (all modern versions do)
- Verify query is not being modified before reaching database

**Issue: Slow search performance**
- Consider adding trigram indexes for large datasets
- Reduce `limit` parameter for fewer results per page
- Add caching layer for frequently searched terms
- Optimize database queries with proper indexes

## Future Enhancements

**Potential Improvements**:
1. **Full-text search** - Implement PostgreSQL full-text search for better relevance
2. **Search suggestions** - Add autocomplete/suggestions as user types
3. **Advanced filters** - Add filters for community type, date range, etc.
4. **Search history** - Persistent search history across sessions
5. **Search analytics** - Track popular search terms for insights
6. **Elasticsearch integration** - For large-scale search requirements
7. **Fuzzy search** - Support typos and approximate matching
8. **Search highlighting** - Highlight matching terms in results

## Related Documentation

- [API Specification](./api-specification.md) - Complete API reference
- [Database Schema](./database-schema.md) - Database structure and relationships
- [Frontend Architecture](../frontend/architecture.md) - Frontend architecture overview
- [Backend Architecture](../backend/architecture.md) - Backend architecture details
