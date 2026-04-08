# User Management Module

## Purpose
This module handles all user-related functionality including registration, authentication, profile management, and user settings.

## Dependencies
- **Database**: users, user_sessions tables
- **Authentication**: JWT tokens, bcryptjs for password hashing
- **File Storage**: Cloudinary for avatar uploads
- **Validation**: Input validation and sanitization

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric + underscores, unique
- `email`: Valid email format, unique
- `password`: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- `displayName`: 1-100 characters, optional

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

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
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
      "avatarUrl": "https://example.com/avatar.jpg",
      "isOnboarded": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### POST /api/auth/logout
Invalidate user session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/auth/me
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
      "bio": "Software developer passionate about React",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isOnboarded": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "stats": {
        "threadCount": 25,
        "commentCount": 150,
        "upvoteCount": 500,
        "spaceCount": 3
      }
    }
  }
}
```

### Profile Management Endpoints

#### PUT /api/users/profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "John Smith",
  "bio": "Updated bio information",
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
      "bio": "Updated bio information",
      "avatarUrl": "https://example.com/new-avatar.jpg",
      "updatedAt": "2024-01-01T01:00:00Z"
    }
  },
  "message": "Profile updated successfully"
}
```

#### POST /api/users/avatar
Upload user avatar image.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Request Body:**
- `avatar` (file): Image file (max 5MB, jpg/png/gif/webp)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/avatars/user_123.jpg",
    "publicId": "avatars/user_123"
  },
  "message": "Avatar uploaded successfully"
}
```

#### DELETE /api/users/avatar
Remove user avatar.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": null
  },
  "message": "Avatar removed successfully"
}
```

### User Settings Endpoints

#### PUT /api/users/settings
Update user preferences and settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "theme": "dark",
  "language": "en",
  "timezone": "UTC-5"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "emailNotifications": true,
      "pushNotifications": false,
      "theme": "dark",
      "language": "en",
      "timezone": "UTC-5"
    }
  },
  "message": "Settings updated successfully"
}
```

#### GET /api/users/settings
Get user settings.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "settings": {
      "emailNotifications": true,
      "pushNotifications": false,
      "theme": "dark",
      "language": "en",
      "timezone": "UTC-5"
    }
  }
}
```

### Public User Endpoints

#### GET /api/users/:username
Get public user profile by username.

**Query Parameters:**
- `includeStats` (boolean, optional): Include user statistics (default: true)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "john_doe",
      "displayName": "John Doe",
      "bio": "Software developer passionate about React",
      "avatarUrl": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00Z",
      "stats": {
        "threadCount": 25,
        "commentCount": 150,
        "upvoteCount": 500,
        "spaceCount": 3
      },
      "recentActivity": [
        {
          "type": "thread",
          "title": "Best practices for React hooks",
          "createdAt": "2024-01-01T12:00:00Z"
        }
      ]
    }
  }
}
```

## Implementation Details

### Database Operations

#### User Creation
```javascript
// services/userService.js
export const createUser = async (userData) => {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(userData.password, saltRounds);

  const [user] = await db('users')
    .insert({
      username: userData.username,
      email: userData.email,
      password_hash: passwordHash,
      display_name: userData.displayName || userData.username
    })
    .returning(['id', 'username', 'email', 'display_name', 'created_at']);

  return user;
};
```

#### Authentication
```javascript
// services/authService.js
export const authenticateUser = async (email, password) => {
  const user = await db('users')
    .where('email', email)
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  return user;
};
```

#### Profile Updates
```javascript
// services/userService.js
export const updateProfile = async (userId, updateData) => {
  const allowedFields = ['display_name', 'bio', 'avatar_url'];
  const filteredData = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  const [user] = await db('users')
    .where('id', userId)
    .update({
      ...filteredData,
      updated_at: new Date()
    })
    .returning(['id', 'username', 'email', 'display_name', 'bio', 'avatar_url']);

  return user;
};
```

### Security Considerations

#### Password Security
- Use bcryptjs with 12 salt rounds for password hashing
- Implement password strength validation
- Store only password hashes, never plain text passwords
- Implement rate limiting for authentication attempts

#### Session Management
- JWT tokens with 7-day expiration
- Secure token storage in httpOnly cookies (optional)
- Token blacklist functionality for logout
- Refresh token mechanism (future enhancement)

#### Input Validation
- Server-side validation for all user inputs
- Email format validation using regex
- Username validation for allowed characters
- XSS prevention through input sanitization

### Frontend Integration

#### Auth Context
```jsx
// context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Profile Component
```jsx
// components/Profile/ProfilePage.jsx
const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.user);
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4">Edit Profile</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Display Name"
          value={formData.displayName}
          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          multiline
          rows={4}
          fullWidth
          margin="normal"
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Container>
  );
};
```

## Testing Implementation

### Current Testing Setup
Unit testing is implemented using Jest with comprehensive test coverage for user management functionality.

### Unit Tests
- User registration and validation
- Profile update operations
- Avatar generation and upload
- Email verification process

### Integration Tests
- Complete user registration flow
- Profile management workflow
- Social media account linking
- User settings persistence

### Security Tests
- Input validation and sanitization
- SQL injection prevention
- XSS protection in user profiles
- Unauthorized profile access prevention
- Session security

## Error Handling

### Error Codes
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Token expired
- `AUTH_003` - Invalid token
- `AUTH_004` - User not found
- `USER_001` - Username already taken
- `USER_002` - Email already registered
- `USER_003` - Invalid email format
- `USER_004` - Password too weak

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "USER_001",
    "message": "Username already taken",
    "details": {
      "field": "username",
      "value": "john_doe"
    }
  }
}
```

## Performance Considerations

### Database Optimization
- Index on `users.email` for login queries
- Index on `users.username` for uniqueness checks
- Profile queries with proper joins
- Caching for frequently accessed user data

### API Optimization
- Pagination for user activity feeds
- Image optimization for avatars
- Lazy loading for user statistics
- Response caching for public profiles

This user management module provides a comprehensive foundation for user authentication and profile management in the Space platform.
