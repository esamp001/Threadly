import { Button } from '@mui/material';
import { useCallback, useState } from 'react';
import apiRequest from '../../config/api';
import { useSnackbar } from '../../context/SnackbarContext';

/**
 * Follow/Unfollow button component
 * This is used to handle follow/unfollow operations on user profiles
 *
 * @param {number} userId - The ID of the user to follow/unfollow
 * @param {boolean} isFollowing - Current follow status
 * @param {function} onFollowUpdate - Callback function to update follow status
 */
const FollowButton = ({ userId, isFollowing, onFollowUpdate }) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);

  /**
   * Handle follow/unfollow action
   * This is used to toggle follow status and update the UI
   */
  const handleFollow = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await apiRequest(`/api/follow/${userId}`, {
        method: localIsFollowing ? 'DELETE' : 'POST'
      });

      if (response.success) {
        const newIsFollowing = !localIsFollowing;
        setLocalIsFollowing(newIsFollowing);
        
        if (onFollowUpdate) {
          onFollowUpdate(
            newIsFollowing,
            response.result.followersCount
          );
        }

        showSnackbar(
          newIsFollowing ? 'User followed' : 'User unfollowed',
          'success'
        );
      } else {
        showSnackbar(response.error_message || 'Action failed', 'error');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showSnackbar('Failed to update follow status', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, localIsFollowing, onFollowUpdate, showSnackbar]);

  return (
    <Button
      variant={localIsFollowing ? 'outlined' : 'contained'}
      onClick={handleFollow}
      disabled={loading}
      fullWidth
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        py: 1.5
      }}
    >
      {loading ? 'Loading...' : localIsFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
