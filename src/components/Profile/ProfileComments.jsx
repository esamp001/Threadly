import { Avatar, Box, Divider, Skeleton, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Profile comments display component
 * This is used to show user's comments with dividers and thread context
 *
 * @param {Array} comments - Array of comment objects
 * @param {boolean} loading - Loading state
 * @param {boolean} hasMore - Whether there are more comments to load
 * @param {function} onLoadMore - Function to load more comments
 */
const ProfileComments = ({ comments, loading, hasMore, onLoadMore }) => {
  const navigate = useNavigate();

  /**
   * Navigate to thread when clicking on thread title
   * This is used to navigate to the parent thread of a comment
   */
  const navigateToThread = useCallback((threadId, spaceId) => {
    navigate(`/spaces/${spaceId}#${threadId}`);
  }, [navigate]);

  if (loading && comments.length === 0) {
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

  if (comments.length === 0 && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No comments yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This user hasn't posted any comments
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {comments.map((comment, index) => (
        <Box key={comment.id}>
          <Box sx={{ mb: 2 }}>
            {/* Thread Context */}
            <Box
              sx={{
                mb: 1,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
              onClick={() => navigateToThread(comment.thread.id, comment.thread.spaceId)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Avatar
                  src={comment.thread.spaceImage}
                  sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
                >
                  {comment.thread.spaceName?.charAt(0)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  in {comment.thread.spaceName}
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
                {comment.thread.title}
              </Typography>
            </Box>

            {/* Comment Content */}
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
                {comment.content?.replace(/<[^>]*>?/gm, '')}
              </Typography>
            </Box>

            {/* Comment Footer */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {comment.timestamp}
              </Typography>
            </Box>
          </Box>

          {index < comments.length - 1 && (
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
            {loading ? 'Loading...' : 'Load More Comments'}
          </button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileComments;
