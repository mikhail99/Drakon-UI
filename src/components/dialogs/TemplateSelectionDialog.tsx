import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorageIcon from '@mui/icons-material/Storage';

import { projectTemplates, ProjectTemplate } from '../../utils/projectTemplates';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const TemplateIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  fontSize: '48px',
}));

const SelectedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
}));

interface TemplateSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('all');

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplateId(template.id);
  };

  const handleConfirm = () => {
    onSelectTemplate(selectedTemplateId);
    onClose();
  };

  // Map template icon names to actual components
  const getIconByName = (iconName: string) => {
    switch (iconName) {
      case 'Calculate':
        return <CalculateIcon fontSize="inherit" />;
      case 'TextFields':
        return <TextFieldsIcon fontSize="inherit" />;
      case 'CallSplit':
        return <CallSplitIcon fontSize="inherit" />;
      case 'AutoAwesome':
        return <AutoAwesomeIcon fontSize="inherit" />;
      case 'Storage':
        return <StorageIcon fontSize="inherit" />;
      default:
        return <AutoAwesomeIcon fontSize="inherit" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select a Project Template</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Choose a template to start with. This will determine the types of nodes available in your project.
        </Typography>
        <Grid container spacing={3}>
          {projectTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <SelectedCard selected={selectedTemplateId === template.id}>
                <CardActionArea
                  onClick={() => handleSelectTemplate(template)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent>
                    <TemplateIcon>
                      {getIconByName(template.icon)}
                    </TemplateIcon>
                    <Typography variant="h6" align="center" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {template.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </SelectedCard>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelectionDialog; 