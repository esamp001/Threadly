import { Button, Typography } from '@mui/material';

/**
 * A flexible, reusable button component with preset variants
 * This is used to create buttons with consistent styling across the application
 * while allowing customization through props
 * 
 * @param {Object} props - Button props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {React.ReactNode} props.startIcon - Icon to display before text
 * @param {string} props.variant - Button variant: 'default', 'primary', 'danger', 'success'
 * @param {Object} props.sx - Additional MUI sx styles for customization
 * @param {Object} props.rest - Any other Button props from MUI
 * @returns {JSX.Element} - Styled button component
 */
const StyledButton = ({
  children,
  onClick,
  disabled = false,
  startIcon,
  variant = 'default',
  sx = {},
  ...rest
}) => {
  // Base style from CustomButton
  const baseStyle = {
    borderRadius: 7,
    typography: 'button',
    fontSize: '10px',
    fontWeight: 300,
    border: '3px solid white',
    letterSpacing: '0.05rem',
    textTransform: 'none',
    boxShadow: theme => `0 4px 0 0 ${theme.palette.primary.main}`,
  };

  // Variant styles
  const variantStyles = {
    default: baseStyle,
    danger: {
      ...baseStyle,
      backgroundColor: '#ffebee',
      borderColor: '#ef9a9a',
      boxShadow: theme => `0 4px 0 0 ${theme.palette.error.main}`,
      '&:hover': {
        backgroundColor: '#ffcdd2',
        borderColor: '#e57373'
      },
    }
  };

  return (
    <Button
      onClick={onClick}
      startIcon={startIcon}
      disabled={disabled}
      sx={{
        ...variantStyles[variant],
        ...sx,
      }}
      variant='contained'
      {...rest}
    >
      <Typography
        variant='subtitle1'
        sx={{
          fontWeight: 300,
          color: disabled ? 'white' : '#d32f2f'
        }}
      >
        {children}
      </Typography>
    </Button>
  );
};

export default StyledButton;
