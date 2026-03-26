import { Box } from '@mui/material';

const SpaceLine = ({ depth = 0, children, isLastChild = false }) => {
  return (
    <Box
      sx={{
        ml: depth * 5,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1
      }}
    >
      {/* Vertical line for this depth level */}
      {depth > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -20,
            top: -16,
            bottom: isLastChild ? '50%' : 0,
            width: '2px',
            backgroundColor: 'divider',
            opacity: 0.6
          }}
        />
      )}

      {/* Horizontal connector line */}
      {/* {depth > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: -20,
            top: 16,
            width: '20px',
            height: '2px',
            backgroundColor: 'divider',
            opacity: 0.6
          }}
        />
      )} */}

      {children}
    </Box>
  );
};

export default SpaceLine;