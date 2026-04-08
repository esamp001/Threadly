# UI/UX Guidelines Specification

## Purpose
This document defines the design system, user interface patterns, and user experience guidelines for the Space platform frontend.

## Design System Overview

### Technology Stack
- **UI Framework**: Material-UI (MUI) v7
- **Styling**: MUI sx prop system
- **Icons**: Lucide React + Material-UI Icons
- **Theme**: Custom dark theme with Spotify-inspired green accents
- **Typography**: Inter font family with Roboto fallback

### Core Design Principles
1. **Dark Mode First** - Optimized for low-light viewing
2. **Consistent Spacing** - 8px grid system
3. **Accessible Design** - WCAG 2.1 AA compliance
4. **Responsive Layout** - All screen sizes from mobile to PC
5. **Micro-interactions** - Subtle animations and transitions

## Color System

### Primary Palette
```javascript
// theme.jsx
palette: {
  mode: "dark",
  primary: {
    main: "#1DB954", // Spotify green vibe 🌿
  },
  background: {
    default: "#121212",    // Deep dark background
    paper: "#1818185e",     // Semi-transparent cards
  },
  text: {
    primary: "#FFFFFF",     // Main text
    secondary: "#B3B3B3",   // Secondary text
    main: "#121212a8",      // Muted text
  },
}
```

### Semantic Colors
```javascript
// Custom color definitions
search: {
  backgroundColor: "#cfc5c5ff", // Light search background
},
button: {
  backgroundColor: "rgba(128, 128, 128, 0.1)", // Transparent gray
}
```

### Status Colors
- **Success**: `#1DB954` (Primary green)
- **Error**: `#E74C3C` (Red)
- **Warning**: `#F39C12` (Orange)
- **Info**: `#3498DB` (Blue)

## Typography System

### Font Hierarchy
```javascript
typography: {
  fontFamily: "Inter, Roboto, sans-serif",
  // Component-level variations
}
```

### Typography Usage
- **Headings**: `variant="h4"`, `variant="h6"` for section titles
- **Subtitles**: `variant="subtitle2"`, `variant="subtitle1"` for metadata
- **Body**: `variant="body1"`, `variant="body2"` for content
- **Buttons**: `typography: 'button'` for button text
- **Captions**: `variant="caption"` for small metadata

### Text Color Guidelines
```javascript
// Primary text (main content)
<Typography color="text.primary">Important content</Typography>

// Secondary text (metadata)
<Typography color="text.secondary">Less important info</Typography>

// Muted text (placeholders)
<Typography color="text.main">Subtle text</Typography>
```

## Component Design Patterns

### Custom Button Component
**Location**: `src/components/HomeComponents/CustomButton.jsx`

**Design Characteristics**:
- **Border Radius**: 7px
- **Border**: 3px solid white
- **Shadow**: Bottom border effect with primary color
- **Typography**: 10px, light weight (300)
- **Letter Spacing**: 0.05rem
- **Text Transform**: None (preserves case)

```javascript
// Usage pattern
<CustomButton 
  onClick={handleAction}
  startIcon={<SomeIcon />}
  disabled={loading}
>
  Button Text
</CustomButton>
```

### Search/Input Components
**Location**: `src/components/HomeComponents/SearchButton.jsx`

**Design Characteristics**:
- **Border**: 3px solid with shadow effect
- **Background**: `search.backgroundColor`
- **Border Radius**: 2px (minimal)
- **Transitions**: Smooth hover and focus states
- **Character Counter**: Integrated character limit display

### Thread Content Cards
**Location**: `src/components/Global/ThreadContent.jsx`

**Layout Structure**:
```javascript
<Paper sx={{ p: 2.5, backgroundColor: 'paper.backgroundColor', mt: 3 }}>
  {/* Header with space avatar and name */}
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Avatar sx={{ height: 40, width: 40, mr: 1 }} />
    <Typography variant="subtitle2" color="primary.main" />
  </Box>
  
  {/* Content section */}
  <Typography variant="h6" sx={{ mt: 1, mb: 1 }} />
  <Typography variant="body2" color="text.secondary" />
  
  {/* Interaction buttons */}
  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
    {/* Vote, comment, share buttons */}
  </Box>
</Paper>
```

## Layout System

### Spacing Guidelines
- **Base Unit**: 8px grid
- **Component Padding**: 16px (2 units)
- **Card Padding**: 20px (2.5 units)
- **Section Margins**: 24px (3 units)
- **Container Gaps**: 8px, 16px, 24px

### Responsive Breakpoints
```javascript
// Material-UI default breakpoints
xs: 0px     // Mobile phones
sm: 600px   // Tablets
md: 900px   // Small laptops
lg: 1200px  // Desktops
xl: 1536px  // Large screens
```

### Container Patterns
```javascript
// Main layout structure - Grid container as parent
<Grid container spacing={2}>
  {/* Left sidebar - hidden on smaller screens */}
  <Grid 
    item 
    size={{ xs: 0, sm: 0, md: 0, lg: 2.9, xl: 2.9 }} 
    sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}
  >
    <LeftContent />
  </Grid>

  {/* Main content */}
  <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6.2, xl: 6.2 }}>
    <MainContent />
  </Grid>

  {/* Right sidebar - hidden on smaller screens */}
  <Grid 
    item 
    size={{ xs: 0, sm: 0, md: 0, lg: 2.9, xl: 2.9 }} 
    sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}
  >
    <RightContent />
  </Grid>
</Grid>
```

### Component Layout Patterns
```javascript
// Flexbox for child components within Grid items
<Box sx={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: 2,
  width: '100%'
}}>
  {/* Children */}
</Box>

// Responsive flex layouts
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 3 }
}}>
  {/* Responsive children */}
</Box>
```

## Interaction Design

### Hover States
```javascript
// Button hover effect
'&:hover': {
  boxShadow: 'none',
  transform: 'translateY(2px)',
}

// Interactive elements
transition: 'all 0.2s ease-in-out',
```

### Focus States
- **Outline**: None (custom styling)
- **Background**: Subtle color change
- **Border**: Primary color accent

### Loading States
```javascript
// Loading indicators
<CircularProgress size={20} />
<Skeleton variant="text" width={200} />
<Skeleton variant="rectangular" height={60} />
```

### Transitions
- **Duration**: 0.2s for micro-interactions
- **Easing**: `ease-in-out`
- **Properties**: Transform, box-shadow, background-color

## Icon System

### Icon Libraries
- **Primary**: Lucide React (`lucide-react`)
- **Secondary**: Material-UI Icons (`@mui/icons-material`)

### Icon Usage Patterns
```javascript
// Lucide icons
import { Home, Search, TrendingUp } from 'lucide-react';

// Material-UI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
```

### Icon Sizing
- **Small**: 16px (inline icons)
- **Medium**: 20px (button icons)
- **Large**: 24px (avatars, headers)
- **Extra Large**: 40px (user avatars)

## Form Design

### Input Field Styling
```javascript
// Custom TextField styling
<TextField
  sx={{
    border: '3px solid',
    boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
    bgcolor: 'search.backgroundColor',
    borderRadius: 2,
    '& .MuiOutlinedInput-root': {
      '& fieldset': { border: 'none' },
    },
  }}
/>
```

### Form Validation
- **Error Colors**: Red accent colors
- **Helper Text**: `variant="caption"`
- **Error States**: Border color change + helper text

### Accessibility
- **Labels**: All inputs have proper labels
- **ARIA**: Appropriate ARIA attributes
- **Keyboard Navigation**: Tab order and focus management
- **Screen Readers**: Semantic HTML structure

## Notification System

### Snackbar Design
**Location**: `src/components/Notifications/Snackbar.jsx`

**Characteristics**:
- **Position**: Top center
- **Duration**: 4000ms auto-hide
- **Z-Index**: 9999 (above all content)
- **Border Radius**: Theme default (12px)
- **Typography**: 14px, 500 weight

### Alert Styling
```javascript
// Custom alert colors by severity
const getAlertStyles = (severity) => {
  switch (severity) {
    case 'success':
      return { backgroundColor: theme.palette.primary.main };
    case 'error':
      return { backgroundColor: '#E74C3C' };
    case 'warning':
      return { backgroundColor: '#F39C12' };
    case 'info':
      return { backgroundColor: '#3498DB' };
  }
};
```

## Avatar System

### Avatar Hierarchy
```javascript
// User avatars
<Avatar
  sx={{ height: 40, width: 40 }}
  src={user.avatar_url}
  alt={user.username}
>
  {user.username.charAt(0).toUpperCase()}
</Avatar>

// Space avatars
<Avatar
  sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
  src={space.avatar_url}
>
  {space.space_name?.charAt(0).toUpperCase()}
</Avatar>
```

### Avatar Guidelines
- **Fallback**: First letter of name in uppercase
- **Sizes**: 24px (small), 40px (medium), 50px (large)
- **Border Radius**: Full circle (50%)

## Responsive Design

### Grid-Based Layout System
**Primary Pattern**: Grid container as parent, flexbox for children

```javascript
// Main responsive layout pattern
<Grid container spacing={2}>
  {/* Hidden on mobile/tablet, visible on desktop */}
  <Grid 
    item 
    size={{ xs: 0, sm: 0, md: 0, lg: 2.9, xl: 2.9 }} 
    sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}
  >
    <SidebarContent />
  </Grid>

  {/* Main content - responsive sizing */}
  <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 6.2, xl: 6.2 }}>
    <MainContent />
  </Grid>
</Grid>
```

### Grid Item Sizing Strategy
```javascript
// Sidebar pattern - hide on smaller screens
size={{ xs: 0, sm: 0, md: 0, lg: 2.9, xl: 2.9 }}
sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}

// Main content pattern - full width on mobile, constrained on desktop
size={{ xs: 12, sm: 12, md: 12, lg: 6.2, xl: 6.2 }}

// Full-width content - always full width
size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
```

### All Screen Sizes Component Approach
```javascript
// Responsive typography within Grid items
<Typography 
  variant="h6" 
  sx={{ 
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
  }}
>

// Responsive flexbox inside Grid items
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 3 }
}}>
```

### Comprehensive Screen Size Strategy
**Approach**: Handle all screen sizes from mobile to PC with specific layouts for each breakpoint

- **Mobile** (xs: 0px+): Hidden sidebars, full-width main content (12 columns)
- **Small Tablet** (sm: 600px+): Hidden sidebars, full-width main content (12 columns)
- **Large Tablet** (md: 900px+): Hidden sidebars, full-width main content (12 columns)
- **Desktop** (lg: 1200px+): Visible sidebars (2.9 columns), constrained main (6.2 columns)
- **Large Desktop** (xl: 1536px+): Optimized spacing for large screens

### Progressive Enhancement Pattern
```javascript
// Progressive layout enhancement across all screen sizes
<Grid container spacing={2}>
  {/* Progressive sidebar visibility */}
  <Grid 
    item 
    size={{ 
      xs: 0,      // Mobile: Hidden
      sm: 0,      // Small Tablet: Hidden  
      md: 0,      // Large Tablet: Hidden
      lg: 2.9,    // Desktop: 2.9 columns
      xl: 2.9     // Large Desktop: 2.9 columns
    }} 
    sx={{ 
      display: { 
        xs: 'none',    // Mobile: Hidden
        sm: 'none',    // Small Tablet: Hidden
        md: 'none',    // Large Tablet: Hidden
        lg: 'block',   // Desktop: Visible
        xl: 'block'    // Large Desktop: Visible
      } 
    }}
  >
    <LeftContent />
  </Grid>

  {/* Adaptive main content sizing */}
  <Grid item size={{ 
    xs: 12,     // Mobile: Full width
    sm: 12,     // Small Tablet: Full width
    md: 12,     // Large Tablet: Full width
    lg: 6.2,    // Desktop: Constrained
    xl: 6.2     // Large Desktop: Constrained
  }}>
    <MainContent />
  </Grid>
</Grid>
```

## Animation Guidelines

### Micro-interactions
- **Button Press**: Transform Y + shadow removal
- **Accordion**: Smooth expand/collapse (0.2s)
- **Icon Rotation**: 180deg rotation for expand/collapse
- **Loading**: Skeleton screens + spinners

### Performance Considerations
- **CSS Transforms**: Hardware accelerated
- **Opacity**: Smooth transitions
- **Avoid**: Layout thrashing animations

## Design Tokens

### Spacing
```javascript
// 8px grid system
const spacing = {
  xs: 4,    // 0.5rem
  sm: 8,    // 1rem
  md: 16,   // 2rem
  lg: 24,   // 3rem
  xl: 32,   // 4rem
};
```

### Border Radius
```javascript
shape: {
  borderRadius: 12, // Global default
}
// Component-specific: 2px, 7px, 12px
```

### Shadows
```javascript
// Custom shadow effects
boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`
```

## Best Practices

### Component Development
1. **Consistent Props**: Use similar prop patterns across components
2. **Theme Integration**: Always use theme colors and spacing
3. **Responsive Design**: Mobile-first breakpoint usage
4. **Accessibility**: Proper ARIA labels and keyboard navigation
5. **Performance**: Optimize re-renders with proper dependencies

### Styling Guidelines
1. **sx Prop**: Primary styling method
2. **Theme Colors**: Always reference theme palette
3. **Consistent Spacing**: Use 8px grid system
4. **Typography**: Use semantic variants
5. **Transitions**: Keep animations subtle and fast

### Code Organization
1. **Component Files**: Keep styling with component logic
2. **Theme Centralization**: All design tokens in theme.jsx
3. **Reusable Components**: Create custom components for common patterns
4. **Prop Interfaces**: TypeScript-style prop documentation

This UI/UX system provides a cohesive, accessible, and maintainable design foundation for the Space platform frontend application.
