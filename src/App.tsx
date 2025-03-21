import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import GraphEditor from './components/graph/GraphEditor';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GraphEditor />
    </ThemeProvider>
  );
}

export default App; 