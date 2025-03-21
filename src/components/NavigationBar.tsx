import React, { useCallback } from 'react';
import { AppBar, Toolbar, IconButton, Tooltip, Button, CircularProgress } from '@mui/material';
import { 
  Add as NewIcon, 
  FolderOpen as OpenIcon, 
  Save as SaveIcon, 
  Undo as UndoIcon, 
  Redo as RedoIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useGraphStore } from '../store/graphStore';
import { useExecutionStore } from '../store/executionStore';

export const NavigationBar: React.FC = () => {
  const { undo, redo, clear } = useGraphStore();
  const history = useGraphStore.getState().history;
  const { runMockExecution, isExecuting } = useExecutionStore();

  const hasPast = history?.past?.length > 0;
  const hasFuture = history?.future?.length > 0;

  const handleNew = useCallback(() => {
    if (window.confirm('Create a new graph? This will clear your current work.')) {
      clear();
    }
  }, [clear]);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const graphData = JSON.parse(e.target?.result as string);
          useGraphStore.setState(graphData);
        } catch (error) {
          console.error('Failed to load graph:', error);
          alert('Failed to load graph. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleSave = useCallback(() => {
    const fileName = window.prompt('Enter a name for your graph', 'graph');
    if (!fileName) return;

    const state = useGraphStore.getState();
    const data = {
      nodes: state.nodes,
      edges: state.edges,
      viewport: state.viewport
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleRun = useCallback(() => {
    runMockExecution();
  }, [runMockExecution]);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar variant="dense">
        <Tooltip title="New Graph">
          <IconButton onClick={handleNew} aria-label="new" size="medium">
            <NewIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Open Graph">
          <IconButton onClick={handleOpen} aria-label="open" size="medium">
            <OpenIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Save Graph">
          <IconButton onClick={handleSave} aria-label="save" size="medium">
            <SaveIcon />
          </IconButton>
        </Tooltip>
        
        <div style={{ flexGrow: 1 }} />

        <Button
          color="primary"
          variant="contained"
          startIcon={isExecuting ? <CircularProgress size={18} color="inherit" /> : <PlayIcon />}
          onClick={handleRun}
          disabled={isExecuting}
          size="small"
          sx={{ mr: 2 }}
        >
          {isExecuting ? 'Running...' : 'Run'}
        </Button>
        
        <Tooltip title="Undo">
          <span>
            <IconButton 
              onClick={undo} 
              disabled={!hasPast} 
              aria-label="undo"
              size="medium"
            >
              <UndoIcon />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Redo">
          <span>
            <IconButton 
              onClick={redo} 
              disabled={!hasFuture} 
              aria-label="redo"
              size="medium"
            >
              <RedoIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}; 