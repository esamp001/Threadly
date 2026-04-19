# Space Roles and Permissions

## Overview
This document defines the role hierarchy and permission system for spaces in the Threadly platform.

## Space Roles

### 1. Owner (Creator)
The user who created the space. Has full control over all space settings and content.

**Permissions:**
- Edit space name, description, avatar, cover photo
- Add/edit/delete space rules
- Manage moderators (add/remove)
- Delete threads/comments
- Ban/unban users from space
- Change community type (public/restricted/private)
- Delete the entire space
- View and manage all space settings

**UI Access:**
- Cover photo upload/remove buttons
- Space rules edit button (modal)
- Moderator management interface
- Space settings page (if implemented)
- Delete space option

### 2. Moderator
Trusted users who help manage the community and moderate content.

**Permissions:**
- Edit space rules
- Delete threads/comments
- Ban/unban users from space
- Pin/unpin threads
- Manage reports (if implemented)
- View member list

**Restrictions:**
- Cannot delete the space
- Cannot remove the owner
- Cannot change community type
- Cannot add other moderators

**UI Access:**
- Space rules edit button (modal)
- Delete thread/comment buttons
- Ban/unban user interface
- Pin/unpin thread controls

### 3. Member
Regular users who have joined the space and can participate in discussions.

**Permissions:**
- Create threads
- Comment on threads
- Vote on threads/comments
- Join/leave space
- View all space content

**Restrictions:**
- Cannot edit space settings
- Cannot moderate content
- Cannot ban users

**UI Access:**
- Create thread button
- Comment input fields
- Vote buttons
- Join/Leave space button

### 4. Non-member
Users who have not joined the space. Access depends on community type.

**Permissions:**
- View threads and comments (if public space)
- Request to join (if restricted/private space)

**Restrictions:**
- Cannot create content
- Cannot vote
- Cannot comment

**UI Access:**
- View-only access to threads (public spaces)
- Join request button (restricted/private spaces)

## Database Schema

### space_roles Table
```sql
CREATE TABLE space_roles (
  id SERIAL PRIMARY KEY,
  space_id INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'moderator', 'member')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

CREATE INDEX idx_space_roles_space_id ON space_roles(space_id);
CREATE INDEX idx_space_roles_user_id ON space_roles(user_id);
CREATE INDEX idx_space_roles_role ON space_roles(role);
```

## Role Hierarchy
```
Owner (highest authority)
  ↓
Moderator
  ↓
Member
  ↓
Non-member (lowest authority)
```

## Permission Matrix

| Action | Owner | Moderator | Member | Non-member |
|--------|-------|-----------|--------|------------|
| Edit space settings | ✅ | ❌ | ❌ | ❌ |
| Edit cover photo | ✅ | ❌ | ❌ | ❌ |
| Edit space rules | ✅ | ✅ | ❌ | ❌ |
| Manage moderators | ✅ | ❌ | ❌ | ❌ |
| Delete space | ✅ | ❌ | ❌ | ❌ |
| Delete threads | ✅ | ✅ | ❌ | ❌ |
| Delete comments | ✅ | ✅ | ❌ | ❌ |
| Ban users | ✅ | ✅ | ❌ | ❌ |
| Pin threads | ✅ | ✅ | ❌ | ❌ |
| Create threads | ✅ | ✅ | ✅ | ❌ |
| Comment | ✅ | ✅ | ✅ | ❌ |
| Vote | ✅ | ✅ | ✅ | ❌ |
| View content | ✅ | ✅ | ✅ | ✅* |

*Non-members can only view content in public spaces

## Implementation Notes

### Frontend Permission Checks
```javascript
// Check if user is owner
const isOwner = user.userId === space.created_by;

// Check if user is moderator
const isModerator = spaceRoles?.some(
  role => role.user_id === user.userId && role.role === 'moderator'
);

// Check if user can edit rules
const canEditRules = isOwner || isModerator;

// Check if user can edit cover photo
const canEditCoverPhoto = isOwner;
```

### Backend Authorization Middleware
```javascript
// Middleware to check space ownership
const checkSpaceOwnership = async (req, res, next) => {
  const space = await knex('spaces').where('id', req.params.spaceId).first();
  if (space.created_by !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  next();
};

// Middleware to check moderator or owner
const checkModeratorOrOwner = async (req, res, next) => {
  const space = await knex('spaces').where('id', req.params.spaceId).first();
  const role = await knex('space_roles')
    .where({ space_id: req.params.spaceId, user_id: req.user.userId })
    .first();
  
  if (space.created_by !== req.user.userId && role?.role !== 'moderator') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  next();
};
```

## Future Enhancements
- Custom role creation
- Granular permissions per role
- Role expiration dates
- Role request/approval system
- Audit log for role changes
