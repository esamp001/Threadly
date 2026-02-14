import { createContext, useContext, useState } from 'react';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <SnackbarContext.Provider value={{ snackbar, showSnackbar, hideSnackbar }}>
            {children}
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => useContext(SnackbarContext);