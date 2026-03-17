import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  subMessage,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          backgroundColor: '#fff',
          borderRadius: 1,
          border: '1px solid #e5e7eb',
          boxShadow: 'none'
        }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ color: '#000' }}   // Black title
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box>
          {subMessage && (
            <Typography
              variant="caption"
              sx={{
                color: '#444'         // Slightly lighter black for hierarchy
              }}
            >
              {subMessage}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: 'none',
            color: '#555'
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          size="small"
          disabled={loading}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            fontWeight: 600,
            boxShadow: 'none'
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;