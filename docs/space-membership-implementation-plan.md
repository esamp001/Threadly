# Space Membership Implementation Plan

## Overview
This document outlines the implementation plan for adding space membership functionality to the Threadly platform. Currently, all users have access to all spaces. This plan will add the ability for users to join and leave spaces.

## Current State
- **No space_members table exists** in the database schema
- **No backend endpoints** for join/leave functionality
- **Frontend "Join Space" button** exists but has no functionality
- **API specification** documents join/leave endpoints but they're not implemented

## Implementation Plan

### Phase 1: Database Schema Changes

#### 1.1 Create space_members Table
Create a new migration file to add the `space_members` table:

```javascript
// Migration file: YYYYMMDDHHMMSS_create_space_members.js

module.exports.up = async (knex) => {
  await knex.schema.createTable('space_members', (table) => {
    table.increments('id').primary();
    
    table.integer('space_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('spaces')
      .onDelete('CASCADE');
    
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    
    // Prevent duplicate memberships
    table.unique(['space_id', 'user_id']);
    
    // Performance indexes
    table.index('space_id');
    table.index('user_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('space_members');
};
```

#### 1.2 Update Database Schema Documentation
Update `docs/global/database-schema.md` to:
- Add `space_members` table to the ER diagram
- Add the table definition in the Core Tables section
- Update the Relationships and Constraints section

### Phase 2: Backend Implementation

#### 2.1 Add Join Space Endpoint
Add to `backend/src/routes/spaces.routes.js`:

```javascript
// POST /api/spaces/:id/join
router.post('/:id/join', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';

  try {
    // Check if space exists
    const space = await knex('spaces').where('id', spaceId).first();
    if (!space) {
      status = 404;
      error_message = 'Space not found';
      success = false;
      throw new Error('Space not found');
    }

    // Check if user is already a member
    const existingMember = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();
    
    if (existingMember) {
      status = 409;
      error_message = 'User is already a member of this space';
      success = false;
      throw new Error('Already a member');
    }

    // Add user to space
    await knex('space_members').insert({
      space_id: spaceId,
      user_id: userId,
      joined_at: knex.fn.now()
    });

  } catch (error) {
    if (!error_message) {
      status = 500;
      error_message = error.message;
      success = false;
    }
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      message: success ? 'Joined space successfully' : undefined
    });
  }
});
```

#### 2.2 Add Leave Space Endpoint
Add to `backend/src/routes/spaces.routes.js`:

```javascript
// DELETE /api/spaces/:id/leave
router.delete('/:id/leave', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';

  try {
    // Check if user is a member
    const member = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();
    
    if (!member) {
      status = 404;
      error_message = 'User is not a member of this space';
      success = false;
      throw new Error('Not a member');
    }

    // Remove user from space
    await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .del();

  } catch (error) {
    if (!error_message) {
      status = 500;
      error_message = error.message;
      success = false;
    }
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      message: success ? 'Left space successfully' : undefined
    });
  }
});
```

#### 2.3 Add Check Membership Endpoint (Optional but Recommended)
Add to `backend/src/routes/spaces.routes.js`:

```javascript
// GET /api/spaces/:id/membership
router.get('/:id/membership', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';
  let isMember = false;

  try {
    const member = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();
    
    isMember = !!member;

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      data: { isMember }
    });
  }
});
```

#### 2.4 Update GET Space Details Endpoint
Modify the existing `GET /api/spaces/:id` endpoint to include membership status:

```javascript
// Add to the space query
const member = await knex('space_members')
  .where({ space_id: id, user_id: req.user?.userId || null })
  .first();

// Include in response
space = {
  // ... existing fields
  isMember: !!member
};
```

#### 2.5 Add Member Count to Space Details
Update the space query to include member count:

```javascript
const memberCount = await knex('space_members')
  .where('space_id', id)
  .count('* as count')
  .first();

space = {
  // ... existing fields
  memberCount: memberCount?.count || 0
};
```

### Phase 3: Frontend Implementation

#### 3.1 Update Space.jsx Component
Add membership state and join/leave functionality:

```javascript
// Add state
const [isMember, setIsMember] = useState(false);
const [memberCount, setMemberCount] = useState(0);
const [joining, setJoining] = useState(false);

// Add membership check function
const checkMembership = useCallback(async () => {
  try {
    const response = await apiRequest(`/api/spaces/${spaceId}/membership`);
    const result = await response.json();
    if (response.ok && result.success) {
      setIsMember(result.data.isMember);
    }
  } catch (error) {
    console.error('Failed to check membership:', error);
  }
}, [spaceId]);

// Add join space function
const handleJoinSpace = useCallback(async () => {
  try {
    setJoining(true);
    const response = await apiRequest(`/api/spaces/${spaceId}/join`, {
      method: 'POST'
    });
    const result = await response.json();
    
    if (response.ok) {
      setIsMember(true);
      setMemberCount(prev => prev + 1);
      showSnackbar('Joined space successfully', 'success');
    } else {
      showSnackbar(result.error_message || 'Failed to join space', 'error');
    }
  } catch (error) {
    showSnackbar('Failed to join space', 'error');
  } finally {
    setJoining(false);
  }
}, [spaceId, showSnackbar]);

// Add leave space function
const handleLeaveSpace = useCallback(async () => {
  try {
    setJoining(true);
    const response = await apiRequest(`/api/spaces/${spaceId}/leave`, {
      method: 'DELETE'
    });
    const result = await response.json();
    
    if (response.ok) {
      setIsMember(false);
      setMemberCount(prev => prev - 1);
      showSnackbar('Left space successfully', 'success');
    } else {
      showSnackbar(result.error_message || 'Failed to leave space', 'error');
    }
  } catch (error) {
    showSnackbar('Failed to leave space', 'error');
  } finally {
    setJoining(false);
  }
}, [spaceId, showSnackbar]);

// Update fetchSpace to include membership data
const fetchSpace = useCallback(async () => {
  try {
    setLoading(true);
    const response = await apiRequest(`/api/spaces/${spaceId}`);
    const result = await response.json();

    if (response.ok) {
      setSpace(result.data?.space || result.space);
      setIsMember(result.data?.space?.isMember || false);
      setMemberCount(result.data?.space?.memberCount || 0);
    } else {
      setError(result.message || 'Failed to load space');
    }
  } catch (error) {
    setError('Failed to load space');
  } finally {
    setLoading(false);
  }
}, [spaceId]);

// Add useEffect to check membership on mount
useEffect(() => {
  if (spaceId && user) {
    checkMembership();
  }
}, [spaceId, user, checkMembership]);
```

#### 3.2 Update AboutSpaceCard Component
Modify the AboutSpaceCard to use dynamic data and add join/leave functionality:

```javascript
const AboutSpaceCard = ({ space, isMember, memberCount, onJoin, onLeave, joining }) => {
  return (
    <Paper sx={{ backgroundColor: 'paper.backgroundColor', p: 2, borderRadius: 1 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <InfoIcon sx={{ fontSize: 14, color: '#9ca3af', mr: 1 }} />
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: 2,
            color: '#9ca3af',
          }}
        >
          ABOUT SPACE
        </Typography>
      </Box>

      {/* Description */}
      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.6,
          color: '#d1d5db',
          mb: 3,
        }}
      >
        {space?.description || 'No description available'}
      </Typography>

      {/* Stats */}
      <Box
        sx={{
          display: 'flex',
          gap: 6,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
            {memberCount || 0}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
            MEMBERS
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: '#22c55e',
            }}
          >
            {/* Add online count if needed */}
            —
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
            ONLINE
          </Typography>
        </Box>
      </Box>

      {/* Created Date */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
          color: '#9ca3af',
        }}
      >
        <CalendarTodayIcon sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 12 }}>
          Created {space?.createdAt || 'Unknown date'}
        </Typography>
      </Box>

      {/* Button */}
      <CustomButton
        onClick={isMember ? onLeave : onJoin}
        disabled={joining}
        sx={{
          width: '100%',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          py: 1.2,
          backgroundColor: isMember ? '#ef4444' : undefined,
          '&:hover': {
            backgroundColor: isMember ? '#dc2626' : undefined,
          }
        }}
      >
        {joining ? 'Processing...' : isMember ? 'Leave Space' : 'Join Space'}
      </CustomButton>
    </Paper>
  );
};
```

#### 3.3 Update Space Component to Pass Props
Update the AboutSpaceCard usage in Space.jsx:

```javascript
<AboutSpaceCard 
  space={space} 
  isMember={isMember}
  memberCount={memberCount}
  onJoin={handleJoinSpace}
  onLeave={handleLeaveSpace}
  joining={joining}
/>
```

### Phase 4: Optional Enhancements

#### 4.1 Access Control for Thread Creation
Add middleware or validation to ensure only space members can create threads:

```javascript
// In maincontent.routes.js or spaces.routes.js
const checkSpaceMembership = async (req, res, next) => {
  const { spaceId } = req.params;
  const userId = req.user.userId;

  try {
    const member = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();
    
    if (!member) {
      return res.status(403).json({
        success: false,
        error_message: 'You must be a member of this space to create threads'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error_message: 'Failed to verify membership'
    });
  }
};

// Apply to thread creation endpoint
router.post('/:spaceId/threads', checkAuth, checkSpaceMembership, async (req, res) => {
  // ... existing thread creation logic
});
```

#### 4.2 Space Member List Endpoint
Add an endpoint to list space members:

```javascript
// GET /api/spaces/:id/members
router.get('/:id/members', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  let status = 200;
  let success = true;
  let error_message = '';
  let members = [];

  try {
    const offset = (page - 1) * limit;

    members = await knex('space_members')
      .join('users', 'space_members.user_id', 'users.id')
      .select(
        'users.id',
        'users.username',
        'users.display_name',
        'users.avatar_url',
        'space_members.joined_at'
      )
      .where('space_members.space_id', spaceId)
      .orderBy('space_members.joined_at', 'desc')
      .limit(limit)
      .offset(offset);

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      members
    });
  }
});
```

#### 4.3 User's Spaces Endpoint
Add an endpoint to get all spaces a user is a member of:

```javascript
// GET /api/users/me/spaces
router.get('/me/spaces', checkAuth, async (req, res) => {
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';
  let spaces = [];

  try {
    spaces = await knex('space_members')
      .join('spaces', 'space_members.space_id', 'spaces.id')
      .select(
        'spaces.id',
        'spaces.space_name as name',
        'spaces.space_description as description',
        'spaces.avatar_url',
        'spaces.cover_image_url as coverImageUrl',
        'space_members.joined_at'
      )
      .where('space_members.user_id', userId)
      .orderBy('space_members.joined_at', 'desc');

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      spaces
    });
  }
});
```

### Phase 5: Testing

#### 5.1 Backend Testing
Create test cases in `backend/tests/`:
- Test joining a space
- Test leaving a space
- Test joining the same space twice (should fail)
- Test leaving a space you're not a member of (should fail)
- Test membership check endpoint
- Test member count accuracy

#### 5.2 Frontend Testing
- Test join button functionality
- Test leave button functionality
- Test button state changes (join vs leave)
- Test membership status on page load
- Test error handling
- Test loading states

#### 5.3 Integration Testing
- Test full flow: join space → create thread → leave space
- Test access control (if implemented)
- Test concurrent join/leave operations

### Phase 6: Data Migration (Optional)

If you want to migrate existing users to spaces:
1. Decide on a migration strategy (e.g., auto-join users to all spaces, or based on activity)
2. Create a migration script to populate space_members table
3. Run migration in development first
4. Test thoroughly before production migration

### Implementation Order

1. **Database migration** (Phase 1)
2. **Backend endpoints** (Phase 2)
3. **Frontend UI** (Phase 3)
4. **Testing** (Phase 5)
5. **Optional enhancements** (Phase 4) - can be done later
6. **Data migration** (Phase 6) - if needed

### Notes

- The `checkAuth` middleware is already in place and should work with the new endpoints
- The API specification already documents the join/leave endpoints, so we just need to implement them
- Consider adding role-based permissions in the future (admin, moderator, member)
- Consider adding private spaces that require approval to join
- The member count in AboutSpaceCard is currently hardcoded - this will be replaced with real data
