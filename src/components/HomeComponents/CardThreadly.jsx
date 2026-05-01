import { Box } from '@mui/material';

/**
 * Custom Card component with Threadly styling
 * This is used to create consistent card UI elements across the application
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {object} props.sx - Additional MUI sx styles
 * @param {function} props.onClick - Optional click handler
 * @param {string} props.borderColor - Custom border color (defaults to primary)
 * @param {boolean} props.hover - Enable hover effects (default: true)
 * @returns {JSX.Element} - Styled card component
 */
const CardThreadly = ({ children, sx, onClick, borderColor, hover = true }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: '100%',
        border: '3px solid',
        borderColor: borderColor || 'primary.main',
        boxShadow: theme => `0 4px 0 0 ${borderColor || theme.palette.primary.main}`,
        bgcolor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: 7,
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme => `0 6px 0 0 ${borderColor || theme.palette.primary.main}`,
            bgcolor: 'rgba(55, 65, 81, 0.6)',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default CardThreadly;
