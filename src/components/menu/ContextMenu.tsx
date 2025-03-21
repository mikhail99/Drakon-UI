import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import SettingsIcon from '@mui/icons-material/Settings';

const MenuContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  boxShadow: theme.shadows[3],
  minWidth: 180,
  zIndex: 1000,
}));

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  open: boolean;
  position: ContextMenuPosition;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  hasSelection: boolean;
  hasClipboard: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  open,
  position,
  onClose,
  onCopy,
  onPaste,
  onDelete,
  hasSelection,
  hasClipboard,
}) => {
  if (!open) return null;

  const handleItemClick = (callback: () => void) => {
    callback();
    onClose();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  // Close menu on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <MenuContainer
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <MenuList>
        <MenuItem 
          onClick={() => handleItemClick(onCopy)} 
          disabled={!hasSelection}
        >
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleItemClick(onPaste)}
          disabled={!hasClipboard}
        >
          <ListItemIcon>
            <ContentPasteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Paste</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleItemClick(onDelete)}
          disabled={!hasSelection}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </MenuList>
    </MenuContainer>
  );
};

export default ContextMenu; 