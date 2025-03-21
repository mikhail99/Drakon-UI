import React from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CommentIcon from '@mui/icons-material/Comment';

import { useGraphStore } from '../../../store/graphStore';

/**
 * GraphControls - Control buttons for the graph editor
 * Provides buttons for undo/redo, zoom, copy/paste, and adding comments
 */
const GraphControls: React.FC = () => {
  const { undo, redo, copySelectedElements, pasteElements } = useGraphStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Add a comment at the center of the viewport
  const addComment = () => {
    const { viewport } = useGraphStore.getState();
    const id = `comment_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate center position
    const position = {
      x: (-viewport.x + window.innerWidth / 2) / viewport.zoom - 75, // Center x, adjusting for node width
      y: (-viewport.y + window.innerHeight / 2) / viewport.zoom - 30, // Center y, adjusting for node height
    };
    
    // Create comment node with proper NodeData structure
    const commentNode = {
      id,
      type: 'comment',
      position,
      data: {
        label: 'Comment',
        type: 'comment',
        inputs: [],
        outputs: [],
        config: { text: 'Add note here...' }
      },
      selected: true,
    };
    
    useGraphStore.getState().addNode(commentNode);
  };

  return (
    <Panel position="top-left">
      <ButtonGroup>
        <Tooltip title="Undo (Ctrl+Z)">
          <Button onClick={undo} size="small">
            <UndoIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <Button onClick={redo} size="small">
            <RedoIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Zoom In">
          <Button onClick={() => zoomIn()} size="small">
            <ZoomInIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button onClick={() => zoomOut()} size="small">
            <ZoomOutIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Fit View">
          <Button onClick={() => fitView()} size="small">
            <FitScreenIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Copy (Ctrl+C)">
          <Button onClick={copySelectedElements} size="small">
            <FileCopyIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Paste (Ctrl+V)">
          <Button onClick={pasteElements} size="small">
            <ContentPasteIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Add Comment (Ctrl+M)">
          <Button onClick={addComment} size="small">
            <CommentIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Panel>
  );
};

export default GraphControls; 