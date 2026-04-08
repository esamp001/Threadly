# State Management Specification

## Purpose
This document defines the state management architecture for the Space platform frontend, including global state, component state, and data flow patterns.

## State Management Overview

### Architecture Approach
- **Primary**: React Context API for global state
- **Secondary**: Local component state with useState hooks
- **Pattern**: Provider-based state distribution
- **Data Flow**: Unidirectional data flow with optimistic updates

### State Management Layers
1. **Global Authentication State** - User session and identity
2. **Global Notification State** - Snackbar and user feedback
3. **Component Local State** - Form data, UI state, temporary data
4. **Server State** - API data with local caching

## Global State Management

### AuthContext
**Location**: `src/context/AuthContext/AuthContext.jsx`

**Purpose**: Manages user authentication and session state

**State Structure**:
```javascript
{
  user: {
    id: 123,
    email: "user@example.com",
    username: "john_doe",
    bio: null,
    avatar_url: "https://example.com/avatar.jpg",
    avatar_seed: "seed-string",
    avatar_options: "{\"style\":\"default\"}",
    is_active: true,
    is_onboarded: false,
    created_at: "2024-01-15T10:30:00Z"
  },
  loading: boolean,
  login: (userData, token) => void,
  logout: () => void,
  fetchUser: () => void
}
```

**Usage Pattern**:
```jsx
import { useAuth } from '../context/AuthContext/AuthContext';

const MyComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;
  
  return <div>Welcome, {user.username}!</div>;
};
```

**Provider Setup**:
```jsx
// App.jsx
<AuthProvider>
  <Routes>
    {/* Protected routes */}
  </Routes>
</AuthProvider>
```

### SnackbarContext
**Location**: `src/context/SnackbarContext.jsx`

**Purpose**: Global notification system for user feedback

**State Structure**:
```javascript
{
  snackbar: {
    open: boolean,
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  },
  showSnackbar: (message, severity) => void,
  hideSnackbar: () => void
}
```

**Usage Pattern**:
```jsx
import { useSnackbar } from '../context/SnackbarContext';

const MyComponent = () => {
  const { showSnackbar } = useSnackbar();
  
  const handleAction = async () => {
    try {
      await apiCall();
      showSnackbar('Action completed successfully', 'success');
    } catch (error) {
      showSnackbar('Action failed', 'error');
    }
  };
};
```

**Provider Setup**:
```jsx
// main.jsx
<SnackbarProvider>
  <App />
  <CustomSnackbar />
</SnackbarProvider>
```

## Component State Management

### Local State Patterns
Components use React's `useState` hook for local state management:

**Form State Example**:
```javascript
const [formData, setFormData] = useState({
  title: '',
  content: '',
  spaceId: ''
});

const handleInputChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

**UI State Example**:
```javascript
const [isExpanded, setIsExpanded] = useState(false);
const [loading, setLoading] = useState(false);
const [selectedThread, setSelectedThread] = useState(null);
```

**Complex State Example** (MainContent.jsx):
```javascript
const [threads, setThreads] = useState([]);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [page, setPage] = useState(1);
const [selectedThreadData, setSelectedThreadData] = useState(null);
const [openCommentThreads, setOpenCommentThreads] = useState({});
```

## Data Flow Patterns

### Optimistic Updates
Pattern for immediate UI updates with server synchronization:

```javascript
const handleVote = async (voteType, threadId) => {
  // 1. Optimistic update - update UI immediately
  setThreads(prev =>
    prev.map(thread => {
      if (thread.id !== threadId) return thread;
      
      const voteValue = voteType === 'upvote' ? 1 : -1;
      const currentVote = thread.userVote || 0;
      
      // Calculate new state
      if (currentVote === voteValue) {
        // Remove vote
        return {
          ...thread,
          net_score: thread.net_score - voteValue,
          userVote: null
        };
      }
      
      // New vote or switch vote
      return {
        ...thread,
        net_score: thread.net_score + voteValue,
        userVote: voteValue
      };
    })
  );

  try {
    // 2. Server call
    const response = await apiRequest('/api/threads/vote', {
      method: 'POST',
      body: JSON.stringify({ threadId, voteType })
    });

    if (response.ok) {
      // 3. Update with server data
      const result = await response.json();
      setThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === result.updatedThread.id
            ? { ...thread, ...result.updatedThread }
            : thread
        )
      );
    } else {
      // 4. Revert on server error
      revertOptimisticUpdate(threadId, voteType);
    }
  } catch (error) {
    // 4. Revert on network error
    revertOptimisticUpdate(threadId, voteType);
  }
};
```

### Pagination Pattern
State management for paginated data:

```javascript
const [threads, setThreads] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const fetchThreads = async (loadMore = false) => {
  if (loading || !hasMore) return;

  const currentPage = loadMore ? page + 1 : 1;
  
  try {
    setLoading(true);
    const response = await apiRequest(`/api/threads?page=${currentPage}&limit=10`);
    const result = await response.json();

    if (result.success) {
      if (loadMore) {
        setThreads(prev => [...prev, ...result.threads]);
        setPage(currentPage);
      } else {
        setThreads(result.threads);
        setPage(1);
      }
      setHasMore(result.pagination.hasMore);
    }
  } catch (error) {
    console.error('Failed to fetch threads:', error);
  } finally {
    setLoading(false);
  }
};
```

## State Synchronization

### Server State Management
API data is managed through custom hooks and local state:

```javascript
const useThreads = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/threads');
      const result = await response.json();
      setThreads(result.threads);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { threads, loading, fetchThreads };
};
```

### Cross-Component State
State sharing between components through context:

```javascript
// Parent component manages state
const ParentComponent = () => {
  const [sharedState, setSharedState] = useState(initialValue);
  
  return (
    <ChildComponent 
      sharedState={sharedState}
      setSharedState={setSharedState}
    />
  );
};

// Child component receives state as props
const ChildComponent = ({ sharedState, setSharedState }) => {
  const updateState = (newValue) => {
    setSharedState(newValue);
  };
  
  return <div>{sharedState}</div>;
};
```

## Performance Considerations

### State Optimization
- **useCallback** for function references in dependencies
- **useMemo** for expensive calculations
- **Debouncing** for frequent state updates
- **Lazy initialization** for complex initial state

### State Updates
```javascript
// Optimized state updates
const [items, setItems] = useState([]);

const addItem = useCallback((newItem) => {
  setItems(prev => [...prev, newItem]);
}, []);

// Expensive calculations memoized
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);
```

## Error Handling in State

### Error State Management
Components handle errors through local state and global notifications:

```javascript
const [error, setError] = useState(null);
const { showSnackbar } = useSnackbar();

const handleAsyncOperation = async () => {
  try {
    setError(null);
    await apiCall();
    showSnackbar('Success', 'success');
  } catch (error) {
    setError(error.message);
    showSnackbar('Operation failed', 'error');
  }
};
```

## State Persistence

### localStorage Integration
Authentication state persists across sessions:

```javascript
// AuthContext persistence
const login = (userData, token) => {
  setUser(userData);
  localStorage.setItem('token', token);
};

const logout = () => {
  setUser(null);
  localStorage.removeItem('token');
};

// Initialize from localStorage
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchUser();
  }
}, []);
```

## Best Practices

### State Management Guidelines
1. **Keep state close to where it's used**
2. **Lift state up when shared between components**
3. **Use context for truly global state**
4. **Implement optimistic updates for better UX**
5. **Handle loading and error states properly**
6. **Use useCallback/useMemo for performance**
7. **Maintain unidirectional data flow**

### Common Patterns
- **Form state**: Local useState with controlled components
- **Server state**: Custom hooks with loading/error states
- **UI state**: Local useState for component-specific state
- **Global state**: Context for authentication and notifications
- **Derived state**: useMemo for computed values

This state management architecture provides a scalable, maintainable approach to handling application state in the Space platform frontend.
