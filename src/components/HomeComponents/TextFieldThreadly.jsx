import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material'

import CustomHelperText from '../Global/CustomHelperText'
const TextFieldThreadly = (props) => {
  const { label, value, onChange, sx, multiline, rows, maxRows, helperText, error, maxLength, showCharCount } = props

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
        maxRows={maxRows}
        sx={{
          width: '100%',
          border: '3px solid',
          boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
          bgcolor: 'search.backgroundColor',
          borderRadius: 7,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme => `0 6px 0 0 ${theme.palette.primary.main}`,
            bgcolor: 'rgba(247, 244, 244, 0.94)',
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
          ...sx,
        }}
        InputProps={{
          sx: {
            color: 'text.main'
          },
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" sx={{ p: 0 }} />
            </InputAdornment>
          ),
          endAdornment: showCharCount && maxLength ? (
            <InputAdornment position="end">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                {value?.length || 0}/{maxLength}
              </Typography>
            </InputAdornment>
          ) : null
        }}
        inputProps={{
          maxLength: maxLength
        }}
      />
      <CustomHelperText text={helperText} error={error} />
    </Box>
  )
}

export default TextFieldThreadly