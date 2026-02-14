// src/components/Notifications/Snackbar.jsx
import { Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '../../context/SnackbarContext';

const CustomSnackbar = () => {
    const theme = useTheme();
    const { snackbar, hideSnackbar } = useSnackbar();

    const getAlertStyles = (severity) => {
        const baseStyles = {
            fontFamily: theme.typography.fontFamily,
            borderRadius: theme.shape.borderRadius,
            fontSize: '14px',
            fontWeight: 500,
        };

        switch (severity) {
            case 'success':
                return {
                    ...baseStyles,
                    backgroundColor: theme.palette.primary.main,
                    color: '#FFFFFF',
                };
            case 'error':
                return {
                    ...baseStyles,
                    backgroundColor: '#E74C3C',
                    color: '#FFFFFF',
                };
            case 'warning':
                return {
                    ...baseStyles,
                    backgroundColor: '#F39C12',
                    color: '#FFFFFF',
                };
            case 'info':
                return {
                    ...baseStyles,
                    backgroundColor: '#3498DB',
                    color: '#FFFFFF',
                };
            default:
                return baseStyles;
        }
    };

    return (
        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={hideSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{
                '& .MuiSnackbar-root': {
                    zIndex: 9999,
                },
            }}
        >
            <Alert
                onClose={hideSnackbar}
                severity={snackbar.severity}
                sx={getAlertStyles(snackbar.severity)}
                variant="filled"
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    );
};

export default CustomSnackbar;