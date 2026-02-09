import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1DB954", // Spotify green vibe 🌿
    },
    background: {
      default: "#121212",
      paper: "#1818185e",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
      main: "#121212a8",
    },
    paper: {
      backgroundColor: "#1818185e",
    },
    search: {
      backgroundColor: "#cfc5c5ff",
    },
    // In theme.jsx
    button: {
      backgroundColor: "rgba(128, 128, 128, 0.1)", // transparent gray
    }
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
})

export default theme