import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1DB954", // Spotify green vibe 🌿
    },
    background: {
      default: "#121212",
      paper: "#181818",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
      main: "#121212a8",
    },
    paper: {
      backgroundColor: "#f3f0f0ff",
    },
    search: {
      backgroundColor: "#cfc5c5ff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
})

export default theme