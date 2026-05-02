# Frontend Coding Standards

## Reusable Functions

**Always prioritize creating reusable helper functions for specific components.** If a function can be used globally across the application, put it in a separate file (e.g., in the `utils` folder).

### Examples:
- Component-specific helpers: Keep within the component file
- Globally reusable functions: Move to `src/utils/`
- API-related utilities: Consider `src/config/` or `src/utils/`

## Function Documentation

All functions must have JSDoc documentation. Use the appropriate format based on function complexity:

### Simple Format (for basic functions):

```javascript
/**
 * [Simple description of what the function does in plain language]
 * This is used to [purpose]
 * @param {type} paramName - [description]
 * @returns {type} - [description]
 */
```

### Comprehensive Format (for complex functions, especially those using hooks):

```javascript
/**
 * [Description of what the function does]
 *
 * Wrapped in [hook name] to memoize the function,
 * preventing unnecessary re-creation on every render.
 *
 * Useful when:
 * - Passing this function as a prop to child components
 * - Using it inside useEffect dependencies
 *
 * Behavior:
 * - [Step 1 of what the function does]
 * - [Step 2 of what the function does]
 * - [Step 3 of what the function does]
 *
 * Dependencies:
 * - [dependency1]: [description]
 * - [dependency2]: [description]
 *
 * Hooks used:
 * - [hook name]
 */
```

### Simple Example:

```javascript
/**
 * Helper function to convert data URL to File
 * This is used to convert base64 image data URLs into File objects for upload
 * @param {string} dataUrl - The base64 data URL (e.g., "data:image/png;base64,iVBORw0KG...")
 * @param {string} filename - The desired filename for the file
 * @returns {File} - A File object created from the data URL
 */
export const dataURLtoFile = (dataUrl, filename) => {
  // Implementation
};
```

### Comprehensive Example:

```javascript
/**
 * Creates a new thread in the current space
 *
 * Wrapped in useCallback to memoize the function,
 * preventing unnecessary re-creation on every render.
 *
 * Useful when:
 * - Passing this function as a prop to child components
 * - Using it inside useEffect dependencies
 *
 * Behavior:
 * - Validates that title and content are not empty
 * - Uploads base64 images to Cloudinary using utility function
 * - Sends processed content to backend API
 * - Refreshes threads list after successful creation
 * - Clears form and resets editor state
 *
 * Dependencies:
 * - formData: Thread title and content
 * - spaceId: Current space ID
 * - showSnackbar: Snackbar notification function
 *
 * Hooks used:
 * - useCallback
 */
const handleCreateThread = useCallback(async () => {
  // Implementation
}, [formData, spaceId, showSnackbar]);
```

### useEffect Documentation

For `useEffect` hooks, use inline comments instead of JSDoc block comments:

```javascript
// Fetch space details when spaceId changes from URL params
useEffect(() => {
  if (spaceId) {
    fetchSpace();
  }
}, [spaceId, fetchSpace]);

// Fetch threads for the space after space data is loaded
useEffect(() => {
  if (space && !loading) {
    fetchThreads(space.id);
  }
}, [space, loading, fetchThreads]);
```

**Guidelines:**
- Use inline comments (//) for useEffect hooks
- Describe what triggers the effect and what it does
- Be specific about dependencies and conditions
- Keep comments concise but informative

## Key Principles

1. **Reusability First**: Always consider if a function can be reused before duplicating code
2. **Clear Documentation**: Every function should be self-documenting through JSDoc comments
3. **Simple Language**: Use plain, simple language in descriptions - avoid jargon
4. **Purpose-Driven**: Documentation should explain WHY something exists, not just WHAT it does

## Theme Usage with sx Props

Always use theme values in `sx` props instead of hardcoded colors for consistency across the application.

### Available Theme Properties

#### Colors (palette)
- `primary.main` - #1DB954 (Spotify green)
- `background.default` - #121212 (main background)
- `background.paper` - #1818185e (paper/surface background)
- `text.primary` - #FFFFFF (main text)
- `text.secondary` - #B3B3B3 (secondary text)
- `shape.borderRadius` - 12px (default border radius)

### Common Usage Patterns

```jsx
// Text styling
<Typography sx={{ color: 'text.primary' }}>
  Primary text
</Typography>

// Background styling
<Box sx={{ bgcolor: 'background.default' }}>
  Main content area
</Box>

// Interactive elements
<Box
  sx={{
    color: 'text.primary',
    bgcolor: 'background.paper',
    borderRadius: 'shape.borderRadius',
    '&:hover': {
      bgcolor: 'primary.main',
      color: 'text.black',
    },
  }}
>
  Interactive element
</Box>
```

### Best Practices
1. **Always use theme values** instead of hardcoded colors
2. **Use semantic color names** (primary, text, background)
3. **Leverage shape.borderRadius** for consistent border radius
4. **Use hover states** with `&:hover` pseudo-selector
5. **Add transitions** for smooth interactions

## File Organization

```
src/
├── components/
│   └── [Component-specific helpers stay in component files]
├── utils/
│   ├── cloudinary.js       # Cloudinary-related utilities
│   ├── api.js              # API-related utilities
│   └── [other global utilities]
└── config/
    └── [configuration files]
```
