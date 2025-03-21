import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Button, 
  ButtonGroup, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import HelpIcon from '@mui/icons-material/Help';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import useProjectFile from '../../hooks/useProjectFile';
import TemplateSelectionDialog from '../dialogs/TemplateSelectionDialog';
import { useTemplateStore } from '../../store/templateStore';

const MenuContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '8px 16px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
});

const StyledButton = styled(Button)({
  minWidth: '80px',
  textTransform: 'none',
  marginRight: '8px',
});

const UnsavedIndicator = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '12px',
  color: '#757575',
});

/**
 * FileMenu - Provides file operations functionality (New, Open, Save, Save As)
 * Includes confirmation dialogs for unsaved changes
 */
const FileMenu: React.FC = () => {
  const { 
    currentFilePath, 
    hasUnsavedChanges, 
    hasContent, 
    createNewProject, 
    openProject, 
    saveProject 
  } = useProjectFile();
  
  const { setActiveTemplate } = useTemplateStore();
  
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [helpDialog, setHelpDialog] = useState(false);

  // Create a new project
  const handleNew = () => {
    if (hasContent()) {
      setPendingAction('new');
      setUnsavedChangesDialog(true);
    } else {
      showTemplateDialog();
    }
  };
  
  // Show template selection dialog
  const showTemplateDialog = () => {
    setTemplateDialog(true);
  };
  
  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    createNewProject();
  };

  // Open an existing project
  const handleOpen = () => {
    if (hasContent()) {
      setPendingAction('open');
      setUnsavedChangesDialog(true);
    } else {
      openFileDialog();
    }
  };

  // Open file input dialog
  const openFileDialog = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      openProject(file).catch(error => {
        alert(`Error loading project: ${error.message}`);
      });
    };
    
    fileInput.click();
  };

  // Save the current project
  const handleSave = () => {
    if (currentFilePath) {
      saveProject();
    } else {
      // If no file path is set, do a Save As instead
      handleSaveAs();
    }
  };

  // Save the project with a new name/location
  const handleSaveAs = () => {
    saveProject('drakon_project.json');
  };

  // Show help dialog
  const handleHelp = () => {
    setHelpDialog(true);
  };

  // Handle confirm button in the unsaved changes dialog
  const handleConfirmUnsavedChanges = () => {
    setUnsavedChangesDialog(false);
    
    // Execute the pending action
    if (pendingAction === 'new') {
      showTemplateDialog();
    } else if (pendingAction === 'open') {
      openFileDialog();
    }
    
    setPendingAction(null);
  };

  // Handle cancel button in the unsaved changes dialog
  const handleCancelUnsavedChanges = () => {
    setUnsavedChangesDialog(false);
    setPendingAction(null);
  };

  return (
    <MenuContainer>
      <ButtonGroup variant="contained" color="primary">
        <Tooltip title="Create a new project">
          <StyledButton 
            startIcon={<NoteAddIcon />} 
            onClick={handleNew}
          >
            New
          </StyledButton>
        </Tooltip>
        
        <Tooltip title="Open an existing project">
          <StyledButton 
            startIcon={<FolderOpenIcon />} 
            onClick={handleOpen}
          >
            Open
          </StyledButton>
        </Tooltip>
        
        <Tooltip title="Save the current project">
          <StyledButton 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            disabled={!hasContent()}
          >
            Save
          </StyledButton>
        </Tooltip>
        
        <Tooltip title="Save the project with a new name">
          <StyledButton 
            startIcon={<SaveAsIcon />} 
            onClick={handleSaveAs}
            disabled={!hasContent()}
          >
            Save As
          </StyledButton>
        </Tooltip>
        
        <Tooltip title="View help information">
          <StyledButton 
            startIcon={<HelpIcon />} 
            onClick={handleHelp}
          >
            Help
          </StyledButton>
        </Tooltip>
      </ButtonGroup>
      
      {/* File path and unsaved changes indicator */}
      <UnsavedIndicator>
        {currentFilePath && (
          <Typography variant="body2" sx={{ marginRight: 1 }}>
            {currentFilePath}
          </Typography>
        )}
        
        {hasUnsavedChanges && (
          <Tooltip title="Unsaved changes">
            <FiberManualRecordIcon 
              fontSize="small" 
              color="error" 
              sx={{ width: 16, height: 16 }}
            />
          </Tooltip>
        )}
      </UnsavedIndicator>
      
      {/* Unsaved Changes Dialog */}
      <Dialog
        open={unsavedChangesDialog}
        onClose={handleCancelUnsavedChanges}
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Do you want to continue without saving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnsavedChanges} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmUnsavedChanges} color="primary" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Template Selection Dialog */}
      <TemplateSelectionDialog 
        open={templateDialog}
        onClose={() => setTemplateDialog(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      
      {/* Help Dialog */}
      <Dialog
        open={helpDialog}
        onClose={() => setHelpDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Help</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <h3>File Operations</h3>
            <ul>
              <li><strong>New</strong> - Create a new empty project (Ctrl+N)</li>
              <li><strong>Open</strong> - Open an existing project file (Ctrl+O)</li>
              <li><strong>Save</strong> - Save the current project (Ctrl+S)</li>
              <li><strong>Save As</strong> - Save the project with a new name</li>
            </ul>
            
            <h3>Keyboard Shortcuts</h3>
            <ul>
              <li><strong>Ctrl+Z</strong> - Undo</li>
              <li><strong>Ctrl+Y</strong> - Redo</li>
              <li><strong>Ctrl+C</strong> - Copy selected elements</li>
              <li><strong>Ctrl+V</strong> - Paste elements</li>
              <li><strong>Ctrl+A</strong> - Select all nodes</li>
              <li><strong>Delete</strong> - Delete selected elements</li>
              <li><strong>Escape</strong> - Deselect all elements</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MenuContainer>
  );
};

export default FileMenu; 