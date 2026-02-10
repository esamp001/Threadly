import { Box, Button, IconButton, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { Camera } from 'lucide-react';


const SearchButton = ({ onExpand }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      <TextField
        onClick={onExpand}
        size="small"
        placeholder="Create new thread title on space"
        sx={{
          width: '80%',
          border: '3px solid',
          boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
          bgcolor: 'search.backgroundColor',
          borderRadius: 7,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: 'text.main',
            opacity: 1,
          },
        }}
        InputProps={{
          sx: {
            color: 'text.main',
          },
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" sx={{ p: 0 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton sx={{ color: 'text.main', p: 0 }} size="small">
                <Camera size={25} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        sx={{
          borderRadius: 7,
          typography: 'button',
          fontWeight: 500,
          border: '3px solid white',
          letterSpacing: '0.05rem',
          textTransform: 'none',
          bgcolor: 'primary.light',
          boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
        }}
        variant='contained'
      >
        <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>Create</Typography>
      </Button>
    </Box>
  )
}

export default SearchButton