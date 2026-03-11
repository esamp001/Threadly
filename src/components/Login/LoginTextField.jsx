// src/components/StyledTextField.jsx
import { Box, TextField, Typography } from '@mui/material';

const LoginTextField = ({
  label,
  placeholder,
  type = 'text',
  rightAction = null,
  ...props
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, ml: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'text.primary',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          {label}
        </Typography>
        {rightAction}
      </Box>
      <TextField
        fullWidth
        placeholder={placeholder}
        type={type}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: 'none',
            '& fieldset': { border: 'none' },
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: 'none' },
            '&.Mui-focused': {
              bgcolor: 'action.hover',
              boxShadow: `0 0 0 2px ${theme => theme.palette.primary.main}`
            }
          },
          '& .MuiInputBase-input': {
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.disabled',
              opacity: 1
            }
          }
        }}
        {...props}
      />
    </Box>
  );
};

export default LoginTextField;