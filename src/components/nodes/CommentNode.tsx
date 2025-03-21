import React, { useState } from 'react';
import { NodeProps, Position } from 'reactflow';
import { styled } from '@mui/material/styles';
import { Paper, TextField, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useGraphStore } from '../../store/graphStore';
import { NodeData } from '../../types/node';
import BaseNode, { PortComponent, PortComponentProps } from './BaseNode';

const CommentContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color?: string }>(({ theme, color }) => ({
  padding: theme.spacing(1.5),
  minWidth: 150,
  maxWidth: 300,
  minHeight: 60,
  backgroundColor: color || '#fffbe6', // Default to light yellow
  borderColor: theme.palette.divider,
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ActionButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: 5,
  right: 5,
  padding: 2,
  opacity: 0.7,
  '&:hover': {
    opacity: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const CommentNode: React.FC<NodeProps<NodeData>> = (props) => {
  const { id, data } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.config?.text || 'Add comment here...');
  const { updateNodeConfig } = useGraphStore();

  const handleSave = () => {
    updateNodeConfig(id, { text });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(data.config?.text || 'Add comment here...');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Define custom handles for the comment node
  const customPortProps: PortComponentProps[] = [
    {
      definition: { id: 'source', label: '', type: 'string' },
      position: Position.Right,
      handleType: 'source',
      handleColor: '#555'
    },
    {
      definition: { id: 'target', label: '', type: 'string' },
      position: Position.Left,
      handleType: 'target',
      handleColor: '#555'
    }
  ];

  // Render the comment content
  const renderCommentContent = () => (
    <CommentContainer 
      color={data.config?.backgroundColor} 
      data-testid="comment-node"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <>
          <TextField
            multiline
            fullWidth
            variant="standard"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            InputProps={{ disableUnderline: true }}
          />
          <ActionButton onClick={handleSave} size="small" aria-label="Save">
            <SaveIcon fontSize="small" />
          </ActionButton>
        </>
      ) : (
        <>
          <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {data.label && <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{data.label}</div>}
            {text}
          </Box>
          <ActionButton onClick={() => setIsEditing(true)} size="small" aria-label="Edit">
            <EditIcon fontSize="small" />
          </ActionButton>
        </>
      )}
    </CommentContainer>
  );

  return (
    <BaseNode {...props} renderHandles={false} className="comment-node">
      {/* Manually add the handles */}
      {customPortProps.map((portProps, index) => (
        <PortComponent
          key={`port-${index}`}
          {...portProps}
        />
      ))}
      {renderCommentContent()}
    </BaseNode>
  );
};

export default CommentNode; 