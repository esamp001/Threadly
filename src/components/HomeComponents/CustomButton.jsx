import { Button } from '@mui/material'

const CustomButton = ({ children, fetchOnclick, startIcon, onClick, disabled, sx }) => (
  <Button
    onClick={onClick || fetchOnclick}
    startIcon={startIcon}
    disabled={disabled}
    disableElevation
    variant='contained'
    sx={{
      borderRadius: '10px',
      textTransform: 'none',
      fontWeight: 700,
      py: 1.4,
      color: '#fff',
      position: 'relative',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      boxShadow: '0 5px 0 rgba(0,0,0,0.8)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 7px 0 rgba(0,0,0,0.8)',
      },
      '&:active': {
        transform: 'translateY(4px)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.8)',
      },
      '&:disabled': {
        boxShadow: 'none',
        transform: 'none',
      },
      ...sx,
    }}
  >
    {children}
  </Button>
)

export default CustomButton
