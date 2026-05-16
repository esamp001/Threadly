import { Box, Divider, Skeleton, Typography } from '@mui/material';
import { format } from 'date-fns';

/**
 * Profile about section component
 * This is used to display user's detailed information and statistics
 *
 * @param {Object} profile - User profile data
 * @param {boolean} isOwnProfile - Whether this is the current user's profile
 */
const ProfileAbout = ({ profile, isOwnProfile }) => {
  /**
   * Format date for display
   * This is used to format join date and other timestamps
   */
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  /**
   * Get level title based on level number
   * This is used to display the user's achievement title
   */
  const getLevelTitle = (level) => {
    const titles = [
      'Newbie',
      'Explorer',
      'Contributor',
      'Advocate',
      'Engager',
      'Collaborator',
      'Influencer',
      'Mentor',
      'Leader',
      'Pioneer',
      'Visionary',
      'Luminary',
      'Sage',
      'Master',
      'Grandmaster'
    ];

    return level <= titles.length ? titles[level - 1] : 'Legendary';
  };

  if (!profile) {
    return (
      <Box>
        <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Bio Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          About {profile.username}
        </Typography>

        {profile.bio ? (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {profile.bio}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {isOwnProfile ? 'You haven\'t added a bio yet' : `${profile.username} hasn't added a bio yet`}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Stats Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Statistics
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile.stats.threadsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Posts Created
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile.stats.commentsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Comments Made
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile.stats.followersCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Followers
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile.stats.followingCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Following
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Level & EXP Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Level & Experience
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {profile.level}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Level
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {getLevelTitle(profile.level)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.expPoints} total EXP points
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Spaces Section */}
      {profile.spaces && profile.spaces.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Active Spaces ({profile.spaces.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {profile.spaces.map((space) => (
                <Box
                  key={space.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {space.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {space.role}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Joined {space.joinedAt}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProfileAbout;
