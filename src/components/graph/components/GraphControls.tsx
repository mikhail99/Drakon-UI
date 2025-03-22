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
import { useNodeOrganizationStore } from '../../../store/nodeOrganizationStore';

/**
 * GraphControls - Control buttons for the graph editor
 * Provides buttons for undo/redo, zoom, copy/paste, and adding comments
 */
const GraphControls: React.FC = () => {
  const { undo, redo, copySelectedElements, pasteElements } = useGraphStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Add a comment node
  const addComment = () => {
    const reactFlowInstance = useReactFlow();
    const position = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    
    // Create a comment node
    const commentNode = {
      id: `comment-${Date.now()}`,
      position,
      data: {
        label: 'Comment',
        type: 'comment',
        inputs: [],
        outputs: [],
        config: { text: 'Add note here...' }
      },
      selected: true,
      type: 'comment'
    };
    
    // Add the node to the graph
    useGraphStore.getState().addNode(commentNode);
    
    // Add the comment node to the default folder
    useNodeOrganizationStore.getState().addNodeToFolder(commentNode.id, 'default');
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