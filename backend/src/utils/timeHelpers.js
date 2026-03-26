/**
 * Formats a date string into a relative time format (e.g., "2hrs ago", "1d ago")
 * @param {string} dateString - The date string to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(dateString) {
  if (!dateString) return 'Unknown time';

  const now = new Date();
  const past = new Date(dateString);

  if (isNaN(past.getTime())) return 'Invalid date';

  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return hours === 1 ? '1hr ago' : `${hours}hrs ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return days === 1 ? '1d ago' : `${days}d ago`;
  }
  const weeks = Math.floor(diffInSeconds / 604800);
  return weeks === 1 ? '1w ago' : `${weeks}w ago`;
}

module.exports = {
  formatRelativeTime
};