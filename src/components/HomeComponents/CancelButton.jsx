import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const CancelButton = () => {
  return (
    <Button
      sx={{
        borderRadius: 7,
        typography: 'button',
        fontWeight: 500,
        border: theme => `3px solid ${theme.palette.grey[400]}`,
        letterSpacing: '0.05rem',
        textTransform: 'none',
        bgcolor: 'transparent',
        color: 'text.primary',
        boxShadow: theme => `0 4px 0 0 ${theme.palette.grey[400]}`,
        '&:hover': {
          bgcolor: theme => theme.palette.action.hover,
          boxShadow: theme => `0 2px 0 0 ${theme.palette.grey[500]}`,
        }
      }}
      variant="contained"
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        Cancel
      </Typography>
    </Button>
  )
}

export default CancelButton