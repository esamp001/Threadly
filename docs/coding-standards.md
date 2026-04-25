# Coding Standards

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

## FormData Uploads

When uploading files using FormData, use raw `fetch` instead of the `apiRequest` utility:

```javascript
const response = await fetch(`${API_URL}/api/cloudinary/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData,
});
```

**Important:**
- Do NOT set `Content-Type` header - the browser automatically sets it to `multipart/form-data` with the correct boundary
- Use raw `fetch` with full URL
- Manually set Authorization header from localStorage
- The `apiRequest` utility sets `Content-Type: application/json` by default, which breaks FormData uploads

## Key Principles

1. **Reusability First**: Always consider if a function can be reused before duplicating code
2. **Clear Documentation**: Every function should be self-documenting through JSDoc comments
3. **Simple Language**: Use plain, simple language in descriptions - avoid jargon
4. **Purpose-Driven**: Documentation should explain WHY something exists, not just WHAT it does

## Object Manipulation

**Always use spread operators for objects** when creating new objects or updating state:

```javascript
// ✅ Good - Use spread operator
const newObj = { ...existingObj, newProp: value };
setState(prev => ({ ...prev, updatedField: newValue }));

// ❌ Bad - Avoid manual object copying
const newObj = Object.assign({}, existingObj, { newProp: value });
const newObj = { id: existingObj.id, name: existingObj.name, newProp: value };
```

**Benefits:**
- Cleaner, more readable code
- Immutable updates
- Prevents reference issues
- Consistent with modern JavaScript patterns

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

## Backend Validation

Always validate field lengths before database operations to prevent database errors and provide better user feedback:

```javascript
// Validations - Check varchar(255) constraints before database insert
if (spaceName && spaceName.length > 255) throw new Error('Space name is too long (max 255 characters)');
if (spaceDescription && spaceDescription.length > 255) throw new Error('Space description is too long (max 255 characters)');
if (spaceSlug && spaceSlug.length > 255) throw new Error('Space slug is too long (max 255 characters)');
if (avatarUrl && avatarUrl.length > 255) throw new Error('Avatar URL is too long (max 255 characters)');
if (avatarPublicId && avatarPublicId.length > 255) throw new Error('Avatar public ID is too long (max 255 characters)');
```

**Benefits:**
- Prevents database constraint violations
- Provides clear, user-friendly error messages
- Fails fast before starting database transactions
- Better user experience than generic database errors

