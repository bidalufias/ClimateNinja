import { createTheme } from '@mui/material/styles';
import { green, teal, orange, brown } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: green[600],
      light: green[400],
      dark: green[800],
    },
    secondary: {
      main: teal[400],
      light: teal[200],
      dark: teal[700],
    },
    error: {
      main: orange[700],
    },
    warning: {
      main: '#FF6B35',
    },
    background: {
      default: '#0a1628',
      paper: '#0d2137',
    },
    text: {
      primary: '#e8f5e9',
      secondary: '#80cbc4',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 900,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 800,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0d2137',
          border: `1px solid ${brown[900]}22`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d2137',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
