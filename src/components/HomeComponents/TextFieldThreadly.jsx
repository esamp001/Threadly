import { Box, IconButton, InputAdornment, TextField } from '@mui/material'

import CustomHelperText from '../Global/CustomHelperText'
const TextFieldThreadly = (props) => {
  const { label, value, onChange, sx, multiline, rows, rowsMax, helperText, error } = props

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextField
        size="small"
        error={error}
        placeholder={label}
        value={value}
        onChange={onChange}
        multiline={multiline}
        rows={rows}
        rowsMax={rowsMax}
        sx={{
          width: '100%',
          border: '3px solid',
          boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
          bgcolor: 'search.backgroundColor',
          borderRadius: 7,
          transition: 'all 0.2s ease-in-out', // Smooth transition
          '&:hover': {
            transform: 'translateY(-2px)', // Lift effect
            boxShadow: theme => `0 6px 0 0 ${theme.palette.primary.main}`, // Deeper shadow
            bgcolor: 'rgba(247, 244, 244, 0.94)', // Slight background change
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
          ...sx, // Merge passed sx styles
        }}
        InputProps={{
          sx: {
            color: 'text.main'
          },
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" sx={{ p: 0 }} />
            </InputAdornment>
          )
        }}
      />
      <CustomHelperText text={helperText} error={error} />
    </Box>
  )
}

export default TextFieldThreadly