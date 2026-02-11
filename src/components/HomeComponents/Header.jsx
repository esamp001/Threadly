import { Avatar, Box, Button, Drawer, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { DiamondPlus, Home, LayoutTemplate, Search as SearchIcon, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ThreadlyLogo from '../../assets/Threadly.png';
import TextFieldThreadly from './TextFieldThreadly';

const Header = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [formData, setFormData] = useState({
    spaceName: '',
    spaceDescription: '',
    spaceSlug: ''
  });


  // Helper function
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - fetch will set it automatically for FormData
        });

        const result = await response.json();

        if (response.ok) {
          console.log('Upload successful:', result);
          // You can store the URL in state if needed
          // setAvatarUrl(result.url);
        } else {
          console.error('Upload failed:', result.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };


  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      px: 7
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={ThreadlyLogo} alt="Threadly Logo" style={{ width: 90, height: 90, padding: 0 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.1rem',
            display: { xs: 'none', sm: 'none', md: 'block' }
          }}
        >
          Threadly
        </Typography>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, gap: 10, ml: 8, alignItems: 'center', }}>
        <Home size={25} />
        <TrendingUp size={25} />
        <LayoutTemplate size={25} />
        <DiamondPlus onClick={() => setOpenDrawer(true)} style={{ cursor: 'pointer' }} size={25} />
      </Box>

      <Drawer
        anchor="top"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        ModalProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
          },
        }}
      >
        <Box sx={{ width: '100%', p: 5 }}>

          <Typography variant="h6">Step 1: About your Space</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Quickly create a space for your community
          </Typography>

          {/* Right side - Avatar upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 150 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                border: '3px solid',
                borderColor: 'primary.main',
                boxShadow: theme => `0 4px 0 0 ${theme.palette.success.main}`, // Green shadow
                bgcolor: 'search.backgroundColor',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme => `0 6px 0 0 ${theme.palette.success.main}`
                },
              }}
            >
              <Typography sx={{ fontWeight: 700, color: 'text.main' }}>Space</Typography>
            </Avatar>
            <Button variant="contained" size="small" component="label">
              Upload Avatar
              <input type="file" hidden accept="image/*"
                onChange={handleAvatarUpload}
              />
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            {/* Left side - Form fields */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <TextFieldThreadly
                  label="Space Name"
                  variant="outlined"
                  value={formData.spaceName}
                  size="small"
                  sx={{ mt: 2, width: '53%' }}
                  required
                  onChange={(e) => {
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    setFormData({ ...formData, spaceName: e.target.value, spaceSlug: slug });
                  }}
                />

                <TextFieldThreadly
                  label="Space URL"
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 2,
                    width: '45%',
                    pointerEvents: 'none', // Prevents clicking
                    cursor: 'not-allowed' // Shows not-allowed cursor
                  }}
                  value={`spaces/${formData.spaceSlug}`}
                  disabled
                />
              </Box>

              <TextFieldThreadly
                label="Description"
                variant="outlined"
                size="small"
                sx={{ mt: 2, width: '100%', borderRadius: 2 }}
                multiline
                rows={4}
                rowsMax={4}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Search Bar */}
      <Grid container>
        <Grid sx={{ width: { xs: 600, sm: 800, md: 1000, lg: 500, xl: 1050 } }}>
          <TextField
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 21,
                '& fieldset': {
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                }
              }
            }}
            size='small'
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, width: 150, justifyContent: 'flex-end', ml: 5 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar sx={{ width: 50, height: 50, }}>J</Avatar>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: 'success.main',
              color: '#fff',
              px: 0.8,
              py: 0.2,
              fontSize: 10,
              borderRadius: '999px',
              fontWeight: 700
            }}
          >
            Lv 12
          </Box>
        </Box>

        <Box sx={{
          alignItems: 'center',
          flexDirection: 'column',
          gap: 1,
          width: 150,
          display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }
        }}>
          <Typography sx={{ fontWeight: 700 }}>John Doe</Typography>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: 'success.light',
              bgcolor: 'rgba(76, 175, 80, 0.12)',
              px: 1,
              py: 0.2,
              borderRadius: '6px',
              letterSpacing: 0.3,
            }}
          >
            Head Hunter
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Header