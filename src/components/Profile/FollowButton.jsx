import { useCallback, useState } from 'react';
import apiRequest from '../../config/api';
import { useSnackbar } from '../../context/SnackbarContext';
import CustomButton from '../HomeComponents/CustomButton';

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
      const raw = await apiRequest(`/api/follow/${userId}`, {
        method: localIsFollowing ? 'DELETE' : 'POST'
      });

      const response = await raw.json();

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
    <CustomButton
      onClick={handleFollow}
      disabled={loading}
      sx={{
        width: '100%',
        // Override styles when already following — muted outlined look
        ...(localIsFollowing && {
          bgcolor: 'background.paper',
          color: 'text.secondary',
          border: '1.5px solid',
          borderColor: 'divider',
          boxShadow: '0 5px 0 rgba(0,0,0,0.18)',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateY(-2px)',
            boxShadow: '0 7px 0 rgba(0,0,0,0.18)',
          },
          '&:active': {
            transform: 'translateY(4px)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.18)',
          },
        })
      }}
    >
      {loading ? 'Loading...' : localIsFollowing ? 'Following' : 'Follow'}
    </CustomButton>
  );
};

export default FollowButton;
