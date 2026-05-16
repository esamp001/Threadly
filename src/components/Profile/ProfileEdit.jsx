import {
  CloseOutlined,
  EditOutlined,
  InfoOutlined,
  PersonOutline,
  SaveOutlined
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import apiRequest from '../../config/api';

/**
 * Profile edit component for Settings tab
 * Allows users to update their profile information
 */
const ProfileEdit = ({ profile, onUpdate, showSnackbar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profile.bio || '');
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    setUpdating(true);
    try {
      const response = await apiRequest('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ bio: editedBio })
      });

      const data = await response.json();

      if (data.success) {
        onUpdate({ ...profile, bio: editedBio });
        showSnackbar('Profile updated successfully', 'success');
        setIsEditing(false);
      } else {
        showSnackbar(data.error_message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedBio(profile.bio || '');
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      {/* Header with Toggle */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profile.avatarUrl}
            sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
          >
            {profile.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Profile Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? 'Editing your profile information' : 'Your personal information'}
            </Typography>
          </Box>
        </Box>

        {!isEditing && (
          <Button
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Username */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonOutline sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Username</Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, px: 0.5 }}>
            {profile.username}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
            Username cannot be changed
          </Typography>
        </Box>

        {/* Bio */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <InfoOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Bio</Typography>
          </Box>

          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write something about yourself..."
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              disabled={updating}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          ) : (
            <Typography
              variant="body1"
              sx={{
                px: 0.5,
                lineHeight: 1.6,
                fontStyle: profile.bio ? 'normal' : 'italic',
                color: profile.bio ? 'text.primary' : 'text.secondary',
                whiteSpace: 'pre-wrap'
              }}
            >
              {profile.bio || "No bio yet."}
            </Typography>
          )}
        </Box>

        {isEditing && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CloseOutlined />}
                onClick={handleCancel}
                disabled={updating}
                sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                onClick={handleSave}
                disabled={updating || (editedBio === (profile.bio || ''))}
                sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 700 }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileEdit;
