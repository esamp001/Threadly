# Infinite Scroll / Lazy Loading Implementation Guide

## Overview

This document explains how infinite scroll (lazy loading) is implemented in Threadly using the Intersection Observer API. The pattern is currently used in the Search component and can be applied to other components like MainContent.

## Concept

Infinite scroll allows users to continuously scroll through content without pagination controls. As the user scrolls down, new data is automatically fetched when they approach the bottom of the current list.

### Key Technologies

- **Intersection Observer API**: Detects when an element enters the viewport
- **React Refs**: Attaches the observer to the last element in the list
- **React useCallback**: Memoizes the observer callback to prevent unnecessary re-renders
- **State Management**: Tracks loading state, pagination, and whether more data is available

## Implementation Pattern (Search.jsx Example)

### 1. State Management

```javascript
const [loading, setLoading] = useState(false);
const [spaces, setSpaces] = useState([]);
const [threads, setThreads] = useState([]);
const [spacesPage, setSpacesPage] = useState(1);
const [threadsPage, setThreadsPage] = useState(1);
const [spacesHasMore, setSpacesHasMore] = useState(true);
const [threadsHasMore, setThreadsHasMore] = useState(true);
const observerRef = useRef(null);
const limit = 10; // Items per page
```

**Key States:**
- `loading`: Prevents duplicate fetches
- `spaces/threads`: Stores the fetched data
- `spacesPage/threadsPage`: Current page number
- `spacesHasMore/threadsHasMore`: Whether more data exists
- `observerRef`: Stores the Intersection Observer instance
- `limit`: Number of items per API request

### 2. Fetch Function

```javascript
const fetchSpaces = useCallback(async (loadMore = false) => {
  // Guard clauses to prevent unnecessary fetches
  if (loading || !spacesHasMore || !searchQuery) return;

  const currentPage = loadMore ? spacesPage + 1 : 1;
  try {
    setLoading(true);
    const response = await apiRequest(
      `/api/search/spaces?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${limit}`
    );
    const result = await response.json();

    if (result.success) {
      if (loadMore) {
        // Append to existing data
        setSpaces(prev => [...prev, ...result.spaces]);
        setSpacesPage(currentPage);
      } else {
        // Replace data (new search)
        setSpaces(result.spaces);
        setSpacesPage(1);
      }
      // Update hasMore based on backend response
      setSpacesHasMore(result.pagination.hasMore);
    }
  } catch (error) {
    console.error('Failed to fetch spaces:', error);
  } finally {
    setLoading(false);
  }
}, [searchQuery, loading, spacesHasMore, spacesPage, limit]);
```

**Key Points:**
- Guard clauses prevent fetching when already loading or no more data
- `loadMore` parameter distinguishes between initial fetch and pagination
- Backend returns `pagination.hasMore` to indicate if more data exists
- Always set `loading` to false in `finally` block

### 3. Intersection Observer Callback

```javascript
const lastElementRef = useCallback((node) => {
  if (loading) return; // Don't observe while loading

  // Disconnect previous observer
  if (observerRef.current) {
    observerRef.current.disconnect();
  }

  // Create new observer
  observerRef.current = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Trigger fetch when element enters viewport
      if (tabValue === 0 && spacesHasMore) {
        fetchSpaces(true); // true = load more
      } else if (tabValue === 1 && threadsHasMore) {
        fetchThreads(true);
      }
    }
  });

  // Observe the element if it exists
  if (node) {
    observerRef.current.observe(node);
  }
}, [loading, tabValue, spacesHasMore, threadsHasMore, fetchSpaces, fetchThreads]);
```

**Key Points:**
- Disconnect previous observer to prevent memory leaks
- Only observe when not loading
- Check `hasMore` before triggering fetch
- Pass `true` to fetch function to indicate load more mode

### 4. Attaching the Ref

```javascript
{spaces.map((space, index) => (
  <Paper
    key={space.id}
    // CRITICAL: Only attach ref to last element AND when hasMore is true
    ref={index === spaces.length - 1 && spacesHasMore ? lastElementRef : null}
    sx={{ /* styles */ }}
  >
    {/* content */}
  </Paper>
))}
```

**CRITICAL PATTERN:**
```javascript
ref={index === array.length - 1 && hasMore ? lastElementRef : null}
```

This condition ensures:
- Ref is only attached to the **last element** in the list
- Ref is only attached when **more data is available**
- Prevents unnecessary observer triggers when no more data exists

### 5. Reset on New Search

```javascript
useEffect(() => {
  if (searchQuery) {
    // Reset all states for new search
    setSpaces([]);
    setThreads([]);
    setSpacesPage(1);
    setThreadsPage(1);
    setSpacesHasMore(true);
    setThreadsHasMore(true);

    // Fetch new results
    if (tabValue === 0) {
      fetchSpaces(false);
    } else {
      fetchThreads(false);
    }
  }
}, [location.search, tabValue]);
```

**Key Points:**
- Reset data arrays to empty
- Reset page numbers to 1
- Reset `hasMore` to true
- Fetch with `loadMore = false` to get fresh data

## Common Pitfalls and Solutions

### Pitfall 1: Ref Always Attached

**Problem:**
```javascript
// BAD - Always true
ref={spaces.length - 1 === spaces.length - 1 ? lastElementRef : null}
```

**Solution:**
```javascript
// GOOD - Only when last element AND hasMore
ref={index === spaces.length - 1 && spacesHasMore ? lastElementRef : null}
```

### Pitfall 2: Duplicate useEffect Hooks

**Problem:**
Having two useEffect hooks that both trigger on `searchQuery` or `tabValue` changes causes duplicate API calls.

**Solution:**
Use a single comprehensive useEffect that handles both initial fetch and state resets.

### Pitfall 3: Not Checking hasMore in Observer

**Problem:**
Observer triggers fetch even when no more data exists, causing infinite API calls.

**Solution:**
Always check `hasMore` in the observer callback before triggering fetch:
```javascript
if (entries[0].isIntersecting && spacesHasMore) {
  fetchSpaces(true);
}
```

### Pitfall 4: Not Disconnecting Observer

**Problem:**
Multiple observers running simultaneously causes memory leaks and duplicate fetches.

**Solution:**
Always disconnect previous observer before creating a new one:
```javascript
if (observerRef.current) {
  observerRef.current.disconnect();
}
```

### Pitfall 5: Loading State Not Preventing Fetches

**Problem:**
Multiple fetches can trigger simultaneously if loading state isn't checked.

**Solution:**
Add guard clause in fetch function:
```javascript
if (loading || !spacesHasMore || !searchQuery) return;
```

## Backend Requirements

The backend API must return pagination information:

```json
{
  "success": true,
  "spaces": [...],
  "pagination": {
    "hasMore": true,
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

- `hasMore`: Boolean indicating if more data exists
- `total`: Total number of items (optional)
- `page`: Current page number
- `limit`: Items per page

## Implementation Checklist

When implementing infinite scroll in a new component:

- [ ] Add state: `loading`, `data`, `page`, `hasMore`, `observerRef`, `limit`
- [ ] Create fetch function with `loadMore` parameter
- [ ] Add guard clauses to prevent unnecessary fetches
- [ ] Create `lastElementRef` callback with Intersection Observer
- [ ] Disconnect previous observer before creating new one
- [ ] Attach ref only to last element when `hasMore` is true
- [ ] Reset states on new search/filter
- [ ] Handle loading states (skeleton, spinner)
- [ ] Handle empty states (no results found)
- [ ] Backend returns `pagination.hasMore`

## Loading States

### Initial Load
```javascript
{loading && data.length === 0 ? (
  // Show skeleton
  <Skeleton />
) : (
  // Show data
)}
```

### Loading More
```javascript
{loading && hasMore && (
  <CircularProgress />
)}
```

### No Results
```javascript
{data.length === 0 && !loading ? (
  <Typography>No results found</Typography>
) : (
  // Show data
)}
```

## Performance Considerations

1. **Use useCallback**: Memoize the observer callback to prevent unnecessary re-renders
2. **Disconnect observers**: Always disconnect to prevent memory leaks
3. **Guard clauses**: Prevent unnecessary API calls
4. **Debounce (optional):** For very fast scrolling, consider debouncing the observer callback

## Accessibility

- Ensure loading states are announced to screen readers
- Provide visual feedback when loading more data
- Allow users to manually load more if automatic loading fails

## Example: Adding to MainContent

To add infinite scroll to MainContent:

1. Add `observerRef` and `lastElementRef` pattern
2. Attach ref to the last thread in the list
3. Check `threadsHasMore` before attaching ref
4. Ensure backend returns pagination info
5. Handle loading and empty states appropriately

## References

- [Intersection Observer API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Refs - React Docs](https://react.dev/reference/react/useRef)
- [Search.jsx Implementation](../src/pages/Search.jsx)
