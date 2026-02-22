import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const SearchButton = ({ expanded, onExpand }) => {
  const [title, setTitle] = useState('');
  const maxLength = 300;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      <TextField
        multiline
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onClick={onExpand}
        placeholder="Create a title..."
        sx={{
          width: '100%',
          border: '3px solid',
          boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
          bgcolor: 'search.backgroundColor',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',  // Add smooth transition
          '&:hover': {
            boxShadow: 'none',  // Remove shadow on hover
            transform: 'translateY(2px)',  // Slight upward movement
          },
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
          endAdornment: (
            <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                {title.length}/{maxLength}
              </Typography>
              <IconButton sx={{ color: 'text.main', p: 0 }} size="small">
                <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{
          maxLength: maxLength,
        }}
      />
    </Box>
  )
}

export default SearchButton;