# Component Library Specification

## Purpose
This document defines all reusable components in the Space platform frontend, their props, usage patterns, and design specifications.

## Component Organization

### Directory Structure
```
src/components/
├── Global/              # App-wide reusable components
├── HomeComponents/      # Home page specific components
├── Login/              # Login/authentication components
├── Notifications/      # Notification and dialog components
└── OnboardingComponents/ # Onboarding flow components
```

## Pages

### Space
**Location**: `src/pages/Space.jsx`

**Purpose**: Page for viewing a specific space and its posts

**Route**: `/spaces/:spaceId`

**Features**:
- Cover photo display
- Space avatar centered on cover photo
- Space name and description
- Posts section for space-specific content

**Usage**:
```javascript
// Navigation to space page
<Link to={`/spaces/${spaceId}`}>
  View Space
</Link>

// Route parameter access
const { spaceId } = useParams();
```

**Component Structure**:
```jsx
<Container maxWidth="lg">
  {/* Cover Photo Section */}
  <Box sx={{ height: 300, position: 'relative' }}>
    <Box sx={{ backgroundColor: 'divider', opacity: 0.3 }} />
    <Avatar sx={{ width: 120, height: 120, zIndex: 1 }}>
      S
    </Avatar>
  </Box>

  {/* Space Information */}
  <Box>
    <Typography variant="h4">Space Name</Typography>
    <Typography variant="body1">Space description</Typography>
  </Box>

  {/* Posts Section */}
  <Box>
    <Typography variant="h6">Posts</Typography>
    <Box>Posts content placeholder</Box>
  </Box>
</Container>
```

**Styling**:
- Uses theme colors for all styling
- Material-UI components for consistency
- Responsive layout with Container
- Placeholder styling for future enhancement

## Global Components

### ProtectedRoute
**Location**: `src/components/Global/ProtectedRoute.jsx`

**Purpose**: Route protection wrapper with authentication and onboarding checks

**Props**:
```javascript
{
  children: ReactNode,           // Protected content
  requireOnboarding: boolean     // Default: true
}
```

**Usage**:
```javascript
<ProtectedRoute requireOnboarding={true}>
  <PrivateComponent />
</ProtectedRoute>
```

**Behavior**:
- Shows loading spinner while checking auth
- Redirects to `/login` if not authenticated
- Redirects to `/onboarding` if onboarding required but not completed
- Redirects to `/home` if onboarding not required but already completed

### VotingComponent
**Location**: `src/components/Global/VotingComponent.jsx`

**Purpose**: Reusable voting UI component with upvote/downvote buttons and score display

**Props**:
```javascript
{
  net_score: number,           // Current vote score to display
  userVote: number,            // Current user's vote (1, 0, or -1)
  onVote: (voteType) => void, // Callback for vote actions ('upvote'/'downvote')
  size: 'small' | 'large',     // Size variant (default: 'small')
  loading: boolean             // Loading state for debounce (default: false)
}
```

**Usage**:
```javascript
// Small size (for comments)
<VotingComponent
  net_score={comment.net_score}
  userVote={comment.userVote}
  onVote={(voteType) => handleCommentVote(voteType, comment.id)}
  size="small"
/>

// Large size (for threads)
<VotingComponent
  net_score={localNetScore}
  userVote={localUserVote}
  onVote={handleVote}
  size="large"
/>
```

**Size Variants**:
- **small**: 20px icons, 0.75rem font, 0.5 padding
- **large**: 28px icons, 0.875rem font, 1 padding

**Design Features**:
- Dynamic background color based on vote state (green for upvote, red for downvote)
- Visual feedback on hover (color change, scale transform)
- Smooth transitions (0.3s for background, 0.2s for interactions)
- Semi-transparent borders for unvoted state
- Text color adjustment based on size (text.primary for large, text.secondary for small when not voted)

**Integration**:
- Used by CommentItem for comment voting (size="small")
- Used by ThreadContent for thread voting (size="large")
- Parent components handle debounce logic and API calls
- Component is UI-only, no business logic

### ThreadContent
**Location**: `src/components/Global/ThreadContent.jsx`

**Purpose**: Display thread content with voting, comments, and sharing functionality

**Props**:
```javascript
{
  net_score: number,
  avatar: string,
  spaceAvatar: string,
  postedBy: string,
  timeAgo: string,
  title: string,
  content: string,
  comments: number,
  shares: number,
  spaceName: string,
  handleVote: (voteType, threadId) => void,
  threadId: number,
  userVote: number,
  onCommentOpen: () => void
}
```

**Usage**:
```javascript
<ThreadContent
  net_score={thread.net_score}
  avatar={thread.avatar_url}
  spaceAvatar={thread.space_avatar_url}
  postedBy={thread.username}
  timeAgo={thread.timeAgo}
  title={thread.title}
  content={thread.content}
  comments={thread.comments}
  shares={thread.shares}
  spaceName={thread.space_name}
  handleVote={handleVote}
  threadId={thread.id}
  userVote={thread.userVote}
  onCommentOpen={() => handleCommentOpen(thread)}
/>
```

**Design Features**:
- Paper card with semi-transparent background
- Space avatar and name header
- Uses VotingComponent for voting UI
- Comment and share counters
- Responsive layout

### CustomHelperText
**Location**: `src/components/Global/CustomHelperText.jsx`

**Purpose**: Display helper text with consistent styling

**Props**:
```javascript
{
  children: ReactNode,    // Helper text content
  // Additional props for styling
}
```

## Home Components

### MainContent
**Location**: `src/components/HomeComponents/MainContent.jsx`

**Purpose**: Main content area with thread creation, display, and management

**Props**:
```javascript
{
  spaces: Array,           // Available spaces
  setSpaces: Function      // Spaces state setter
}
```

**Features**:
- Thread creation with Quill editor
- Space selection dropdown
- Thread list with infinite scroll
- Comment panel integration
- Optimistic voting system
- Real-time updates

**State Management**:
- Threads list with pagination
- Form data for thread creation
- Loading states
- Comment panel states

### CustomButton
**Location**: `src/components/HomeComponents/CustomButton.jsx`

**Purpose**: Custom styled button with consistent design

**Props**:
```javascript
{
  children: ReactNode,     // Button content
  fetchOnclick: Function,  // Click handler (alias for onClick)
  startIcon: ReactNode,    // Icon before text
  onClick: Function,       // Click handler
  disabled: boolean        // Disabled state
}
```

**Usage**:
```javascript
<CustomButton 
  onClick={handleAction}
  startIcon={<SomeIcon />}
  disabled={loading}
>
  Button Text
</CustomButton>
```

**Design Characteristics**:
- 3px solid white border
- Bottom shadow with primary color
- 7px border radius
- 10px font size, light weight
- 0.05rem letter spacing

### SearchButton
**Location**: `src/components/HomeComponents/SearchButton.jsx`

**Purpose**: Expandable search/title input with character counter

**Props**:
```javascript
{
  expanded: boolean,       // Expanded state
  onExpand: Function,      // Toggle expansion
  title: string,          // Input value
  setTitle: Function      // Value setter
}
```

**Features**:
- Multiline input with 300 character limit
- Character counter display
- Expand/collapse functionality
- Custom styling with shadow effects
- Hover and focus states

### Header
**Location**: `src/components/HomeComponents/Header.jsx`

**Purpose**: Application header with space creation, search, and navigation

**Props**:
```javascript
{
  openDrawer: boolean,     // Drawer state
  setOpenDrawer: Function, // Drawer setter
  onSpaceCreated: Function // Space creation callback
}
```

**Features**:
- Space creation with stepper flow
- Avatar upload with Cloudinary
- Topic selection
- Privacy settings
- Search functionality
- Responsive design

### CommentPanel
**Location**: `src/components/HomeComponents/CommentPanel.jsx`

**Purpose**: Thread comment panel with nested comments

**Props**:
```javascript
{
  isOpen: boolean,         // Panel open state
  isClose: Function,       // Close handler
  threadId: number,        // Thread ID
  threadData: Object,      // Thread information
  onCommentCountUpdate: Function // Comment count callback
}
```

**Features**:
- Nested comment display
- Comment creation with Quill
- Real-time comment updates
- Optimistic updates
- Vote functionality on comments

### CommentItem
**Location**: `src/components/HomeComponents/CommentItem.jsx`

**Purpose**: Individual comment display with voting and replies using debounce-based optimistic updates

**Props**:
```javascript
{
  comment: Object,         // Comment data
  comments: Array,         // All comments state
  setComments: Function,   // Comments state setter
  depth: number,           // Nesting depth for replies
  expandedReplies: Object, // Expanded reply states
  newCommentId: number,    // ID of newly created comment
}
```

**Features**:
- Comment voting system with debounce approach (500ms delay)
- Reply functionality with Quill editor
- Nested comment display with recursive rendering
- User avatars and timestamps
- Optimistic UI updates for voting
- Spam clicking protection via request cancellation

**Voting Implementation**:

**Debounce Pattern**:
- Immediate optimistic update on each click
- 500ms debounce timer before sending to server
- Cancels previous pending requests on new clicks
- Only final vote state is sent to server

**Vote Logic (Toggle-based)**:
```javascript
// Frontend toggle logic
if (actionType === 'upvote') {
  newUserVote = (oldUserVote === 1) ? 0 : 1;
} else {
  newUserVote = (oldUserVote === -1) ? 0 : -1;
}
// Score change = newUserVote - oldUserVote
```

**Helper Functions**:
- `updateVoteRecursively`: Updates vote state through comment tree
- `findCommentById`: Locates specific comment in nested structure

**State Management**:
- Uses local state for reply inputs
- Receives comments array from parent for voting
- Optimistic updates modify comments array directly
- Rollback on error to maintain consistency

**Integration with Backend**:
- Sends `voteValue` (1, 0, or -1) to backend - final vote state
- Backend updates vote record and returns `{ success: true }` (no data)
- Frontend uses optimistic updates, does not sync server response
- Rollback on error if API call fails (excluding AbortError)
- No idempotency keys (debounce handles spam protection)

### LeftContent / RightContent
**Location**: `src/components/HomeComponents/LeftContent.jsx` / `RightContent.jsx`

**Purpose**: Sidebar content components

**Props**: Component-specific props for sidebar content

**Usage**:
```javascript
<Grid item size={{ xs: 0, lg: 2.9 }}>
  <LeftContent />
</Grid>
```

### BottomNav
**Location**: `src/components/HomeComponents/BottomNav.jsx`

**Purpose**: Bottom navigation for mobile devices

**Props**: Navigation-specific props

**Features**:
- Mobile-optimized navigation
- Icon-based navigation items
- Active state indicators

### TextFieldThreadly
**Location**: `src/components/HomeComponents/TextFieldThreadly.jsx`

**Purpose**: Custom text field with Threadly styling

**Props**:
```javascript
{
  // Standard TextField props
  // Custom styling applied
}
```

### SpaceLine
**Location**: `src/components/HomeComponents/SpaceLine.jsx`

**Purpose**: Space display component with consistent styling

**Props**: Space-specific props for display

### CancelButton
**Location**: `src/components/HomeComponents/CancelButton.jsx`

**Purpose**: Cancel button with consistent styling

**Props**:
```javascript
{
  children: ReactNode,     // Button content
  onClick: Function        // Click handler
}
```

## Login Components

### LoginTextField
**Location**: `src/components/Login/LoginTextField.jsx`

**Purpose**: Styled text field for login forms

**Props**:
```javascript
{
  label: string,           // Field label
  placeholder: string,     // Placeholder text
  type: string,           // Input type (default: 'text')
  rightAction: ReactNode,  // Right side action component
  ...props                // Additional TextField props
}
```

**Usage**:
```javascript
<LoginTextField
  label="Email"
  placeholder="Enter your email"
  type="email"
  rightAction={<ForgotPasswordLink />}
/>
```

**Design Features**:
- Uppercase labels with letter spacing
- Custom background color
- Focus states with primary color border
- No border outlines
- Custom placeholder styling

## Notification Components

### ConfirmationDialog
**Location**: `src/components/Notifications/ConfirmationDialog.jsx`

**Purpose**: Reusable confirmation dialog for user actions

**Props**:
```javascript
{
  open: boolean,           // Dialog open state
  onClose: Function,       // Close handler
  onConfirm: Function,     // Confirm handler
  title: string,          // Dialog title (default: 'Are you sure?')
  subMessage: string,     // Optional sub-message
  confirmText: string,    // Confirm button text (default: 'Confirm')
  cancelText: string,     // Cancel button text (default: 'Cancel')
  loading: boolean        // Loading state for confirm button
}
```

**Usage**:
```javascript
<ConfirmationDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Delete Thread"
  subMessage="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  loading={deleting}
/>
```

**Design Features**:
- Light theme dialog (overrides dark theme)
- Max width 'xs' for mobile optimization
- No elevation or shadow
- Custom button styling
- Loading state support

### Snackbar
**Location**: `src/components/Notifications/Snackbar.jsx`

**Purpose**: Global snackbar notification system

**Props**: Uses context for state management

**Features**:
- Top center positioning
- 4000ms auto-hide duration
- Custom severity styling
- Z-index 9999
- Theme integration

**Severity Styles**:
- Success: Primary green (#1DB954)
- Error: Red (#E74C3C)
- Warning: Orange (#F39C12)
- Info: Blue (#3498DB)

## Onboarding Components

### CardOnboarding
**Location**: `src/components/OnboardingComponents/CardOnboarding.jsx`

**Purpose**: Onboarding card component for user guidance

**Props**: Onboarding-specific props

**Features**:
- Step-by-step guidance
- Progress indicators
- Interactive elements

## Component Patterns

### Consistent Prop Patterns
```javascript
// Event handlers
onClick: Function
onClose: Function
onConfirm: Function

// State management
loading: boolean
disabled: boolean

// Content
children: ReactNode
title: string
```

### Styling Patterns
- **Theme Integration**: All components use theme colors
- **Responsive Design**: Mobile-first with breakpoint handling
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized re-renders with proper dependencies

### State Management Integration
- **AuthContext**: Used in ProtectedRoute
- **SnackbarContext**: Used in notification components
- **Local State**: Component-specific state with useState
- **Optimistic Updates**: Used in voting and content creation

## Usage Guidelines

### Component Selection
- **Global Components**: Use across multiple pages
- **Home Components**: Specific to home page layout
- **Login Components**: Authentication forms only
- **Notification Components**: User feedback and confirmations
- **Onboarding Components**: New user guidance only

### Best Practices
1. **Consistent Props**: Use similar prop patterns across components
2. **Theme Colors**: Always reference theme palette
3. **Responsive Design**: Consider all screen sizes
4. **Accessibility**: Include proper labels and ARIA attributes
5. **Error Handling**: Provide loading and error states
6. **Performance**: Use React.memo for expensive components

This component library provides a comprehensive, maintainable set of reusable components for the Space platform frontend application.
