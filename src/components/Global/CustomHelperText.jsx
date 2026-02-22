import { Typography } from '@mui/material';

const CustomHelperText = ({ text, error, sx }) => {
  if (!text) return null;

  return (
    <Typography
      variant="caption"
      sx={{
        fontSize: '12px',
        mt: 0.5,
        ml: 1,
        color: error ? 'error.main' : 'text.secondary',
        ...sx
      }}
    >
      {text}
    </Typography>
  );
};

export default CustomHelperText;