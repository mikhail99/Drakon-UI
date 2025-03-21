import React, { useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { styled } from '@mui/material/styles';
import { Paper, TextField, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import useGraphStore from '../../store/graphStore';
import { NodeData } from '../../types/node';

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

const StyledHandle = styled(Handle)(({ theme }) => ({
  width: 8,
  height: 8,
  background: theme.palette.primary.main,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  right: 2,
  padding: 4,
}));

const CommentNode: React.FC<NodeProps<NodeData>> = ({ id, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.config?.text || 'Add comment here...');
  const { updateNodeConfig } = useGraphStore();

  const handleSave = () => {
    updateNodeConfig(id, { text });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <CommentContainer color={data.config?.color} className="comment-node">
      <StyledHandle
        type="source"
        position={Position.Right}
        id="source"
      />
      <StyledHandle
        type="target"
        position={Position.Left}
        id="target"
      />
      
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
          <ActionButton onClick={handleSave} size="small">
            <SaveIcon fontSize="small" />
          </ActionButton>
        </>
      ) : (
        <>
          <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {text}
          </Box>
          <ActionButton onClick={() => setIsEditing(true)} size="small">
            <EditIcon fontSize="small" />
          </ActionButton>
        </>
      )}
    </CommentContainer>
  );
};

export default CommentNode; 