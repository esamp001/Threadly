import { Avatar, Box, Divider, Menu, MenuItem, Paper, Skeleton, Typography } from "@mui/material"
import { Calendar, Ellipsis, Flame, Grid, List, RefreshCw, TrendingUp } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import apiRequest from "../../config/api"

const LeftContent = () => {
  const navigate = useNavigate()
  const [trendingSpaces, setTrendingSpaces] = useState([])
  const [hotThreads, setHotThreads] = useState([])
  const [hotSpaces, setHotSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [hotThreadsLoading, setHotThreadsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [menuAnchor, setMenuAnchor] = useState(null)

  // Fetch trending spaces on component mount
  useEffect(() => {
    const fetchTrendingSpaces = async () => {
      try {
        setLoading(true)
        const response = await apiRequest('/api/spaces/trending')
        const result = await response.json()
        if (result.success) {
          setTrendingSpaces(result.spaces)
        }
      } catch (error) {
        console.error('Failed to fetch trending spaces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingSpaces()
  }, [])

  // Fetch hot spaces on component mount
  useEffect(() => {
    const fetchHotSpaces = async () => {
      try {
        setHotThreadsLoading(true)
        const response = await apiRequest('/api/maincontent/hot_spaces')
        const result = await response.json()
        if (result.success) {
          setHotSpaces(result.spaces)
        }
      } catch (error) {
        console.error('Failed to fetch hot spaces:', error)
      } finally {
        setHotThreadsLoading(false)
      }
    }

    fetchHotSpaces()
  }, [])

  // Handle space card click
  const handleSpaceClick = (spaceId) => {
    navigate(`/spaces/${spaceId}`)
  }

  // Handle thread click
  const handleThreadClick = (threadId, spaceId) => {
    navigate(`/spaces/${spaceId}#thread-${threadId}`)
  }

  /**
   * Refreshes the trending spaces list by re-fetching from the API
   * This is used to get the latest trending spaces data
   * @param {string} timeFilter - The time filter to apply (all, today, week, month)
   */
  const handleRefresh = useCallback(async (timeFilter = 'all') => {
    try {
      setLoading(true)
      const url = timeFilter === 'all'
        ? '/api/spaces/trending'
        : `/api/spaces/trending?timePeriod=${timeFilter}`
      const response = await apiRequest(url)
      const result = await response.json()
      if (result.success) {
        setTrendingSpaces(result.spaces)
      }
    } catch (error) {
      console.error('Failed to refresh trending spaces:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Changes the time filter for trending spaces
   * This is used to filter spaces by time period (all, today, week, month)
   * @param {string} newFilter - The filter value to apply
   */
  const handleFilterChange = useCallback((newFilter) => {
    handleRefresh(newFilter)
  }, [handleRefresh])

  /**
   * Changes the view mode for trending spaces display
   * This is used to switch between grid and list layouts
   * @param {string} newViewMode - The view mode to apply ('grid' or 'list')
   */
  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode)
  }, [])

  /**
   * Opens the dropdown menu
   * This is used to display the menu with filter and view options
   * @param {Event} event - The click event that triggered the menu
   */
  const handleMenuOpen = useCallback((event) => {
    setMenuAnchor(event.currentTarget)
  }, [])

  /**
   * Closes the dropdown menu
   * This is used to hide the menu after an option is selected
   */
  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null)
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>
          Hot Right Now
        </Typography>

        {/* Content of left side - Hot Spaces */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {hotThreadsLoading ? (
            // Show skeleton while loading
            Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 2
              }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" height={18} width="70%" />
                </Box>
              </Box>
            ))
          ) : hotSpaces.length > 0 ? (
            // Show hot spaces
            hotSpaces.map((space) => (
              <Box
                key={space.id}
                onClick={() => handleSpaceClick(space.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  src={space.avatar_url}
                  alt={space.space_name}
                >
                  {space.space_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Box component="span" sx={{ color: 'primary.main' }}>spaces/</Box>
                    <Box component="span" sx={{ color: 'text.primary' }}>{space.space_slug?.replace('spaces/', '') || space.space_name}</Box>
                  </Typography>
                </Box>
                <Flame size={16} color="#ff6b35" />
              </Box>
            ))
          ) : (
            // Empty state
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No hot spaces
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Content of left side - Trending Spaces */}
      <Paper sx={{ p: 2, backgroundColor: 'paper.backgroundColor', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>
            Trending Spaces
          </Typography>

          <Box
            onClick={handleMenuOpen}
            sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            <Ellipsis color="gray" size={20} />
          </Box>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { bgcolor: 'background.default' } }}
        >
          <MenuItem onClick={() => { handleRefresh(); handleMenuClose(); }}>
            <RefreshCw size={16} style={{ marginRight: 8 }} />
            Refresh
          </MenuItem>
          <MenuItem onClick={() => { handleFilterChange('today'); handleMenuClose(); }}>
            <TrendingUp size={16} style={{ marginRight: 8 }} />
            Today's Trending
          </MenuItem>
          <MenuItem onClick={() => { handleFilterChange('week'); handleMenuClose(); }}>
            <Calendar size={16} style={{ marginRight: 8 }} />
            This Week
          </MenuItem>
          <MenuItem onClick={() => { handleFilterChange('month'); handleMenuClose(); }}>
            <Calendar size={16} style={{ marginRight: 8 }} />
            This Month
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleViewModeChange('grid'); handleMenuClose(); }}>
            <Grid size={16} style={{ marginRight: 8 }} />
            Grid View
          </MenuItem>
          <MenuItem onClick={() => { handleViewModeChange('list'); handleMenuClose(); }}>
            <List size={16} style={{ marginRight: 8 }} />
            List View
          </MenuItem>
        </Menu>

        {/* Content of left side - Spaces */}
        {viewMode === 'grid' ? (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1.3, justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              // Show skeleton while loading
              Array.from({ length: 6 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: { xs: 130, md: 120, lg: 150 },
                    width: { xs: 110, md: 100, lg: 120 },
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: '#FFFFFF',
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      px: 1,
                      py: 0.5
                    }}
                  >
                    <Skeleton variant="text" width="80%" height={14} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="60%" height={12} />
                  </Box>
                </Box>
              ))
            ) : trendingSpaces.length > 0 ? (
              // Show trending spaces in grid view
              trendingSpaces.map((space) => (
                <Box
                  key={space.id}
                  onClick={() => handleSpaceClick(space.id)}
                  sx={{
                    height: { xs: 130, md: 120, lg: 130 },
                    width: { xs: 110, md: 100, lg: 120 },
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {space.avatar_url ? (
                    <Box
                      component="img"
                      src={space.avatar_url}
                      alt={space.space_name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h4" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {space.space_name?.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: '#FFFFFF',
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      px: 1,
                      py: 0.5
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Box component="span" sx={{ color: 'primary.main' }}>spaces/</Box>
                      <Box component="span" sx={{ color: 'black' }}>{space.space_slug?.replace('spaces/', '') || space.space_name}</Box>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.7rem', fontWeight: 500 }}>
                      {space.member_count || 0} members
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              // Empty state
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No trending spaces
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // List view
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading ? (
              // Show skeleton while loading
              Array.from({ length: 6 }).map((_, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 2
                }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" height={18} width="70%" />
                  </Box>
                </Box>
              ))
            ) : trendingSpaces.length > 0 ? (
              // Show trending spaces in list view
              trendingSpaces.map((space) => (
                <Box
                  key={space.id}
                  onClick={() => handleSpaceClick(space.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    src={space.avatar_url}
                    alt={space.space_name}
                  >
                    {space.space_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Box component="span" sx={{ color: 'primary.main' }}>spaces/</Box>
                      <Box component="span" sx={{ color: 'text.primary' }}>{space.space_slug?.replace('spaces/', '') || space.space_name}</Box>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
                      {space.member_count || 0} members
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              // Empty state
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No trending spaces
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default LeftContent