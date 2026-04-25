/**
 * Helper functions for managing search-related localStorage operations
 * This is used to store and retrieve recent search queries
 */

const RECENT_SEARCHES_KEY = 'threadly_recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Retrieves recent searches from localStorage
 * This is used to get the user's search history for the dropdown
 * @returns {string[]} - Array of recent search queries
 */
export const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve recent searches:', error);
    return [];
  }
};

/**
 * Adds a search query to recent searches in localStorage
 * This is used to save a new search query to the user's history
 * @param {string} query - The search query to add
 */
export const addRecentSearch = (query) => {
  try {
    const recentSearches = getRecentSearches();
    
    // Remove the query if it already exists (to move it to the top)
    const filteredSearches = recentSearches.filter(search => search !== query);
    
    // Add the new query to the beginning
    const updatedSearches = [query, ...filteredSearches];
    
    // Keep only the most recent searches
    const trimmedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmedSearches));
  } catch (error) {
    console.error('Failed to add recent search:', error);
  }
};

/**
 * Clears all recent searches from localStorage
 * This is used when the user clicks "Clear Recent Searches" button
 */
export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
};

/**
 * Removes a specific search query from recent searches
 * This is used when the user clicks the "x" button on a specific recent search
 * @param {string} query - The search query to remove
 */
export const removeRecentSearch = (query) => {
  try {
    const recentSearches = getRecentSearches();
    const filteredSearches = recentSearches.filter(search => search !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filteredSearches));
  } catch (error) {
    console.error('Failed to remove recent search:', error);
  }
};
