import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import FinalChar from '../../assets/FINAL CHAR.png';
import apiRequest, { API_URL } from '../../config/api';
import { useSnackbar } from '../../context/SnackbarContext';

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;

const BugReportFab = () => {
  const { showSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [reportSentVisible, setReportSentVisible] = useState(false);

  const confirmationTimeoutRef = useRef(null);

  // Clear pending timeout when component unmounts to avoid stale state updates
  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) {
        window.clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Resets bug report form state
   * This is used to clear all user input after submit or cancel
   */
  const resetForm = useCallback(() => {
    setMessage('');
    setScreenshotFile(null);
  }, []);

  /**
   * Opens the bug report modal dialog
   * This is used to start a new user feedback report flow
   */
  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, []);

  /**
   * Closes the bug report modal dialog and resets form fields
   * This is used to safely exit the report flow without stale input
   */
  const handleCloseDialog = useCallback(() => {
    if (sending) return;
    setOpen(false);
    resetForm();
  }, [sending, resetForm]);

  /**
   * Shows the inline "report sent" confirmation near the floating button
   * This is used to provide clear completion feedback after a successful submission
   */
  const showSentConfirmation = useCallback(() => {
    setReportSentVisible(true);

    if (confirmationTimeoutRef.current) {
      window.clearTimeout(confirmationTimeoutRef.current);
    }

    confirmationTimeoutRef.current = window.setTimeout(() => {
      setReportSentVisible(false);
    }, 5000);
  }, []);

  /**
   * Validates screenshot file type and size
   * This is used to enforce image-only upload and 5MB size limit before submitting
   * @param {File} file - User selected file
   * @returns {boolean} - True when file is valid for submission
   */
  const validateScreenshotFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please upload an image file only', 'error');
      return false;
    }

    if (file.size > MAX_SCREENSHOT_SIZE) {
      showSnackbar('Screenshot must be 5MB or less', 'error');
      return false;
    }

    return true;
  }, [showSnackbar]);

  /**
   * Handles screenshot input changes
   * This is used to validate and store an optional screenshot for the report
   * @param {Event} event - File input change event
   */
  const handleScreenshotChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateScreenshotFile(file)) {
      event.target.value = '';
      return;
    }

    setScreenshotFile(file);
  }, [validateScreenshotFile]);

  /**
   * Uploads screenshot file to Cloudinary through existing upload infrastructure
   * This is used to attach a persistent image URL in the bug report email
   * @param {File} file - Screenshot file to upload
   * @returns {Promise<string>} - Cloudinary screenshot URL
   */
  const uploadScreenshotToCloudinary = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/api/cloudinary/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result?.url) {
      throw new Error(result?.message || 'Failed to upload screenshot');
    }

    return result.url;
  }, []);

  /**
   * Submits the current bug report to backend
   * This is used to collect user feedback and send it through the existing email pipeline
   */
  const handleSubmitBugReport = useCallback(async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      showSnackbar('Please enter your bug report details', 'error');
      return;
    }

    try {
      setSending(true);
      let screenshotUrl = null;

      if (screenshotFile) {
        screenshotUrl = await uploadScreenshotToCloudinary(screenshotFile);
      }

      const response = await apiRequest('/api/reports/bug', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmedMessage,
          screenshot_url: screenshotUrl,
          page_url: window.location.href,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error_message || 'Failed to submit bug report');
      }

      showSnackbar(result.message || 'Report has been sent', 'success');
      setOpen(false);
      resetForm();
      showSentConfirmation();
    } catch (error) {
      showSnackbar(error.message || 'Failed to submit bug report', 'error');
    } finally {
      setSending(false);
    }
  }, [message, screenshotFile, showSnackbar, uploadScreenshotToCloudinary, resetForm, showSentConfirmation]);

  return (
    <>
      {reportSentVisible && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: { xs: 160, sm: 110 },
            px: 2,
            py: 1,
            zIndex: 1500,
            bgcolor: 'success.main',
            color: 'common.white',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Report has been sent.
          </Typography>
        </Paper>
      )}

      <Box
        sx={{
          position: 'fixed',
          right: 16,
          bottom: { xs: 90, sm: 24 },
          zIndex: 1400,
        }}
      >
        <Tooltip title="Report a bug" placement="left" arrow>
          <IconButton
            onClick={handleOpenDialog}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              p: 0,
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: 4,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Box
              component="img"
              src={FinalChar}
              alt="Report bug"
              sx={{
                width: 52,
                height: 52,
                objectFit: 'contain',
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            color: 'text.primary',
          },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          Report a Bug
          <IconButton
            onClick={handleCloseDialog}
            disabled={sending}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Your feedback helps improve Space for future development. Please describe what happened so we can investigate faster.
          </Typography>

          <TextField
            label="Bug details"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            fullWidth
            required
            multiline
            minRows={4}
            maxRows={10}
            disabled={sending}
            inputProps={{ maxLength: 2000 }}
            helperText={`${message.length}/2000`}
            sx={{ mb: 2 }}
          />

          <Button
            component="label"
            variant="outlined"
            startIcon={<PhotoCameraRoundedIcon />}
            disabled={sending}
            sx={{ textTransform: 'none' }}
          >
            {screenshotFile ? 'Change screenshot' : 'Upload screenshot (optional)'}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
            />
          </Button>

          {screenshotFile && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Selected: {screenshotFile.name}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} disabled={sending} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitBugReport}
            variant="contained"
            disabled={sending}
            sx={{ textTransform: 'none' }}
          >
            {sending ? 'Sending...' : 'Send report'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BugReportFab;
