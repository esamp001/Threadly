# Frontend Architecture

## Purpose
This document describes the frontend architecture of the Space platform, including component structure, state management, and development patterns.

## Technology Stack
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **UI Library**: Material-UI (MUI) 7.3.7
- **Routing**: React Router DOM 7.13.0
- **State Management**: React Context API
- **Styling**: Material-UI + Emotion
- **Icons**: Material Icons + Lucide React + Remixicon
- **Rich Text**: TipTap 3.19.0
- **Avatars**: DiceBear 9.4.0
- **Real-time**: Firebase 12.10.0

## Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Global/             # Cross-app components
│   │   ├── Header.jsx
│   │   ├── ThreadContent.jsx
│   │   └── ProtectedRoute.jsx
│   ├── HomeComponents/     # Homepage specific components
│   │   ├── CommentPanel.jsx
│   │   ├── CustomButton.jsx
│   │   ├── Header.jsx
│   │   ├── MainContent.jsx
│   │   └── ...
│   ├── Login/              # Authentication components
│   ├── Notifications/      # Notification system
│   └── OnboardingComponents/ # User onboarding
├── pages/                  # Route-level components
├── context/                # React context providers
├── config/                 # App configuration
├── utils/                  # Helper functions
├── assets/                 # Static assets
├── App.jsx                 # Main app component
├── main.jsx               # App entry point
└── theme.jsx              # Material-UI theme configuration
```

## Component Architecture

### Component Hierarchy
```
App
├── Router
│   ├── ProtectedRoute
│   │   ├── Header (Global)
│   │   └── Page Components
│   │       ├── Home
│   │       │   ├── MainContent (HomeComponents)
│   │       │   ├── CommentPanel (HomeComponents)
│   │       │   └── ThreadContent (Global)
│   │       ├── Onboarding
│   │       │   └── CardOnboarding (OnboardingComponents)
│   │       └── Login
│   └── Public Routes
│       └── Login Pages
└── Context Providers
    ├── AuthContext
    ├── NotificationContext
    └── ThemeContext
```

### Component Patterns

#### 1. Functional Components with Hooks
All components are functional and use React hooks for state and side effects.

```jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ExampleComponent = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Component lifecycle logic
  }, []);

  return <div>{/* JSX content */}</div>;
};
```

#### 2. Custom Hooks for API Calls
Centralized API logic in custom hooks.

```jsx
// hooks/useApi.js
const useApi = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};
```

#### 3. Prop Composition Pattern
Complex components built by composing simpler ones.

```jsx
const ThreadCard = ({ thread, onVote, onComment }) => (
  <Card>
    <ThreadHeader thread={thread} />
    <ThreadContent content={thread.content} />
    <ThreadActions 
      thread={thread} 
      onVote={onVote} 
      onComment={onComment} 
    />
  </Card>
);
```

## State Management

### Context API Structure

#### AuthContext
```jsx
// context/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    // Login logic
  };

  const logout = () => {
    // Logout logic
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### NotificationContext
```jsx
// context/NotificationContext.jsx
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification) => {
    // Add notification logic
  };

  const markAsRead = (id) => {
    // Mark as read logic
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

### Local State Patterns

#### 1. useState for Simple State
```jsx
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({});
```

#### 2. useReducer for Complex State
```jsx
const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
};

const [formState, dispatch] = useReducer(formReducer, initialState);
```

#### 3. useMemo/useCallback for Performance
```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback((id) => {
  onItemClick(id);
}, [onItemClick]);
```

## Routing Architecture

### Route Structure
```jsx
// App.jsx
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/spaces/:id" element={
          <ProtectedRoute>
            <SpacePage />
          </ProtectedRoute>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};
```

### Protected Routes
```jsx
// components/Global/ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

## API Integration

### API Client Configuration
```jsx
// config/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Usage Pattern
API calls are made directly using the configured api instance without a separate service layer.

Example usage:
```jsx
// Direct API calls in components
import api from '../config/api';

// Fetch threads
const response = await api.get(`/spaces/${spaceId}/threads`);

// Create thread
const newThread = await api.post(`/spaces/${spaceId}/threads`, threadData);

// Vote on thread
await api.post(`/threads/${threadId}/vote`, { voteType });
```

## UI Component Architecture

### Material-UI Theme
```jsx
// theme.jsx
import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1DB954", // Spotify green vibe 🌿
    },
    background: {
      default: "#121212",
      paper: "#1818185e",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
      main: "#121212a8",
    },
    paper: {
      backgroundColor: "#1818185e",
    },
    search: {
      backgroundColor: "#cfc5c5ff",
    },
    button: {
      backgroundColor: "rgba(128, 128, 128, 0.1)", // transparent gray
    }
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
})

export default theme;
```

### Component Composition
```jsx
// components/HomeComponents/MainContent.jsx
const MainContent = () => {
  const { threads, loading } = useThreads();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Recent Threads
        </Typography>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Grid container spacing={3}>
            {threads.map((thread) => (
              <Grid item xs={12} md={6} lg={4} key={thread.id}>
                <ThreadCard thread={thread} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};
```

## Performance Optimization

### Code Splitting
```jsx
// Lazy loading for route components
const HomePage = lazy(() => import('../pages/HomePage'));
const SpacePage = lazy(() => import('../pages/SpacePage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    {/* Routes */}
  </Routes>
</Suspense>
```

### Memoization
```jsx
// Memo for expensive components
const ThreadCard = memo(({ thread, onVote }) => {
  return (
    <Card>
      {/* Thread content */}
    </Card>
  );
});

// useMemo for expensive calculations
const sortedThreads = useMemo(() => {
  return threads.sort((a, b) => b.createdAt - a.createdAt);
}, [threads]);
```

### Virtual Scrolling
```jsx
// For large lists
import { FixedSizeList as List } from 'react-window';

const ThreadList = ({ threads }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ThreadCard thread={threads[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={threads.length}
      itemSize={200}
    >
      {Row}
    </List>
  );
};
```

## Error Handling

### Error Boundaries
```jsx
// components/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.children;
  }
}
```

### Global Error Handling
```jsx
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server error
    switch (error.response.status) {
      case 401:
        // Handle unauthorized
        break;
      case 404:
        // Handle not found
        break;
      default:
        // Handle other errors
    }
  } else if (error.request) {
    // Network error
  } else {
    // Other error
  }
};
```

## Testing Strategy

### Current Implementation
Unit testing is implemented using Jest and React Testing Library for component testing.

### Component Testing
Components are tested using React Testing Library and Jest.

Example test structure:
```jsx
// ThreadCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ThreadCard from './ThreadCard';

describe('ThreadCard', () => {
  const mockThread = {
    id: 1,
    title: 'Test Thread',
    content: 'Test content',
    author: { displayName: 'Test User' },
  };

  test('renders thread information correctly', () => {
    render(<ThreadCard thread={mockThread} />);
    
    expect(screen.getByText('Test Thread')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('calls onVote when vote button is clicked', () => {
    const mockOnVote = jest.fn();
    render(<ThreadCard thread={mockThread} onVote={mockOnVote} />);
    
    fireEvent.click(screen.getByRole('button', { name: /upvote/i }));
    expect(mockOnVote).toHaveBeenCalledWith(1, 'upvote');
  });
});
```

## Deployment

### Production Environment
- **Platform**: Render (static site deployment)
- **Build Process**: Vite build optimization
- **Asset Hosting**: Cloudinary CDN for images
- **Environment Variables**: Configured via Render dashboard

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Environment**: Local .env files for development configuration

This frontend architecture provides a scalable, maintainable foundation for the Space platform's user interface.
