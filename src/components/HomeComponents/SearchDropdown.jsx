import { Avatar, Box, Divider, IconButton, Popover, Skeleton, Typography } from '@mui/material';
import { Search as SearchIcon, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../config/api';
import { addRecentSearch, clearRecentSearches, getRecentSearches, removeRecentSearch } from '../../utils/searchHelpers';

const SearchDropdown = ({ anchorEl, open, onClose, searchQuery }) => {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSpaces, setPopularSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch popular spaces when dropdown opens
  useEffect(() => {
    const fetchPopularSpaces = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const response = await apiRequest('/api/header/popular-spaces');
        const result = await response.json();
        if (result.success) {
          setPopularSpaces(result.spaces);
        }
      } catch (error) {
        console.error('Failed to fetch popular spaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSpaces();
  }, [open]);

  // Load recent searches from localStorage when dropdown opens
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Handle clicking on a recent search
  const handleRecentSearchClick = useCallback((query) => {
    addRecentSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  }, [navigate, onClose]);

  // Handle clicking on a popular space
  const handleSpaceClick = useCallback((spaceId) => {
    navigate(`/spaces/${spaceId}`);
    onClose();
  }, [navigate, onClose]);

  // Handle clearing all recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Handle removing a specific recent search
  const handleRemoveRecent = useCallback((e, query) => {
    e.stopPropagation();
    removeRecentSearch(query);
    setRecentSearches(prev => prev.filter(search => search !== query));
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableAutoFocus
      disableEnforceFocus
      disablePortal
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 500,
          mt: 1,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Recent Searches
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={handleClearRecent}
              >
                Clear
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
              {recentSearches
                .filter(search =>
                  !searchQuery ||
                  search.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((search, index) => (
                  <Box
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <SearchIcon size={16} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {search}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleRemoveRecent(e, search)}
                      sx={{ p: 0.5 }}
                    >
                      <X size={14} sx={{ color: 'text.secondary' }} />
                    </IconButton>
                  </Box>
                ))}
              {recentSearches.filter(search =>
                !searchQuery ||
                search.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && recentSearches.length > 0 && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No recent searches match
                    </Typography>
                  </Box>
                )}
            </Box>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {/* Popular Spaces Section */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
          Popular Spaces
        </Typography>

        {loading ? (
          // Show skeleton while loading
          Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          ))
        ) : popularSpaces.length > 0 ? (
          // Show popular spaces filtered by search query
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {popularSpaces
              .filter(space =>
                !searchQuery ||
                space.space_name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((space) => (
                <Box
                  key={space.id}
                  onClick={() => handleSpaceClick(space.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <Avatar
                    src={space.avatar_url}
                    sx={{ width: 32, height: 32, fontSize: '0.75rem' }}
                  >
                    {space.space_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {space.space_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {space.member_count || 0} members
                    </Typography>
                  </Box>
                </Box>
              ))}
            {popularSpaces.filter(space =>
              !searchQuery ||
              space.space_name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No spaces match your search
                  </Typography>
                </Box>
              )}
          </Box>
        ) : (
          // Empty state
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No popular spaces available
            </Typography>
          </Box>
        )}
      </Box>
    </Popover>
  );
};

export default SearchDropdown;
