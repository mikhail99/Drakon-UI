import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Button, AppBar, Toolbar, Typography, Box } from '@mui/material';
import GraphEditor from './components/graph/GraphEditor';
import GraphErrorBoundary from './components/error/GraphErrorBoundary';
import NodeStyleDemo from './components/demo/NodeStyleDemo';

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
  const [showDemo, setShowDemo] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Drakon UI
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setShowDemo(!showDemo)}
          >
            {showDemo ? 'Show Editor' : 'Show Node Demo'}
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ height: 'calc(100vh - 64px)' }}>
        <GraphErrorBoundary componentName="Application">
          {showDemo ? (
            <NodeStyleDemo />
          ) : (
            <GraphEditor />
          )}
        </GraphErrorBoundary>
      </Box>
    </ThemeProvider>
  );
}

export default App; 