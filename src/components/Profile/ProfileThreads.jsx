import { Avatar, Box, Divider, Skeleton, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Profile threads display component
 * This is used to show user's created threads with voting and navigation
 *
 * @param {Array} threads - Array of thread objects
 * @param {boolean} loading - Loading state
 * @param {boolean} hasMore - Whether there are more threads to load
 * @param {function} onLoadMore - Function to load more threads
 */
const ProfileThreads = ({ threads, loading, hasMore, onLoadMore }) => {
  const navigate = useNavigate();

  /**
   * Navigate to thread when clicking on thread title
   * This is used to navigate to the thread page
   */
  const navigateToThread = useCallback((threadId, spaceId) => {
    navigate(`/spaces/${spaceId}#${threadId}`);
  }, [navigate]);

  if (loading && threads.length === 0) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <Box key={index}>
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={16} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={16} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            {index < 4 && <Divider sx={{ mb: 2 }} />}
          </Box>
        ))}
      </Box>
    );
  }

  if (threads.length === 0 && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No posts yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This user hasn't created any posts
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {threads.map((thread, index) => (
        <Box key={thread.id}>
          <Box sx={{ mb: 2 }}>
            {/* Thread Header */}
            <Box
              sx={{
                mb: 1,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
              onClick={() => navigateToThread(thread.id, thread.space.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar
                  src={thread.space.image}
                  sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
                >
                  {thread.space.name?.charAt(0)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  in {thread.space.name}
                </Typography>
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                {thread.title}
              </Typography>
            </Box>

            {/* Thread Content Preview */}
            {thread.content && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {thread.content?.replace(/<[^>]*>?/gm, '')}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {thread.timestamp}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {thread.commentsCount} comments
              </Typography>
            </Box>
          </Box>

          {index < threads.length - 1 && (
            <Divider sx={{ mb: 2, borderColor: 'divider' }} />
          )}
        </Box>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <button
            onClick={onLoadMore}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              color: 'text.primary',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileThreads;
