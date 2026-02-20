import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'remixicon/fonts/remixicon.css'
import App from './App.jsx'
import CustomSnackbar from './components/Notifications/Snackbar'
import { SnackbarProvider } from "./context/SnackbarContext"
import './index.css'
import theme from './theme'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
          <CustomSnackbar />
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)