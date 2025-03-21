import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  Badge,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import OutputIcon from '@mui/icons-material/BarChart';
import ErrorIcon from '@mui/icons-material/Error';

import NodeConfiguration from '../configuration/NodeConfiguration';
import TextJsonViewer from './TextJsonViewer';
import TableViewer from './TableViewer';
import ValueDisplay from './ValueDisplay';
import { useExecutionStore } from '../../store/executionStore';
import { useGraphStore } from '../../store/graphStore';

const PanelContainer = styled(Paper)(({ theme }) => ({
  width: 300,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 0,
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: 0,
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: '100%', display: value !== index ? 'none' : 'flex', flexDirection: 'column' }}
    >
      {value === index && <>{children}</>}
    </div>
  );
};

interface ResultsPanelProps {
  onClose?: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { selectedElements, nodes } = useGraphStore();
  const { 
    executionStatus, 
    isExecuting, 
    results, 
    runMockExecution 
  } = useExecutionStore();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Update selected node when selection changes
  useEffect(() => {
    if (selectedElements.nodes.length === 1) {
      setSelectedNodeId(selectedElements.nodes[0]);
    } else {
      setSelectedNodeId(null);
    }
  }, [selectedElements]);
  
  // Switch to results tab when execution starts
  useEffect(() => {
    if (isExecuting || executionStatus !== 'idle') {
      setTabIndex(1);
    }
  }, [isExecuting, executionStatus]);
  
  // Get the selected node result
  const selectedNodeResult = selectedNodeId 
    ? results[selectedNodeId]
    : null;
  
  // Count errors
  const errorCount = Object.values(results).filter(r => r.status === 'error').length;
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // Start execution
  const handleRunExecution = () => {
    runMockExecution();
  };
  
  // Render results content based on data type
  const renderResultContent = () => {
    if (!selectedNodeResult) {
      return (
        <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body2" color="textSecondary" align="center">
            {Object.keys(results).length === 0
              ? 'Run the graph to see execution results'
              : 'Select a node to view its execution results'}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunExecution}
            sx={{ mt: 2 }}
            disabled={isExecuting}
          >
            {isExecuting ? 'Running...' : 'Run Graph'}
          </Button>
        </Box>
      );
    }
    
    if (selectedNodeResult.status === 'running') {
      return (
        <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Processing...
          </Typography>
        </Box>
      );
    }
    
    if (selectedNodeResult.status === 'error') {
      return (
        <Box p={2} display="flex" flexDirection="column" height="100%">
          <Box 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              <ErrorIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Execution Error
            </Typography>
            <Typography variant="body2">
              {selectedNodeResult.error || 'An unknown error occurred'}
            </Typography>
          </Box>
        </Box>
      );
    }
    
    // Show appropriate result viewer based on data type
    const { data } = selectedNodeResult;
    const nodeInfo = nodes.find(n => n.id === selectedNodeId);
    const nodeLabel = nodeInfo?.data?.label || 'Node';
    
    if (data === undefined || data === null) {
      return (
        <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body2" color="textSecondary">
            No result data available
          </Typography>
        </Box>
      );
    }
    
    // Simple value display for primitives
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return (
        <Box p={2} height="100%">
          <ValueDisplay 
            value={data} 
            label={nodeLabel} 
            type={typeof data as 'string' | 'number' | 'boolean'} 
          />
        </Box>
      );
    }
    
    // Table view for arrays
    if (Array.isArray(data)) {
      return (
        <Box p={2} height="100%">
          <TableViewer data={data} title={nodeLabel} />
        </Box>
      );
    }
    
    // Default to JSON view for objects
    return (
      <Box p={2} height="100%">
        <TextJsonViewer data={data} title={nodeLabel} />
      </Box>
    );
  };
  
  return (
    <PanelContainer elevation={1}>
      <PanelHeader>
        <Typography variant="subtitle1">Inspector</Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </PanelHeader>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="fullWidth"
          aria-label="panel tabs"
        >
          <Tab 
            icon={<SettingsIcon />} 
            label="Configuration" 
            id="tab-0" 
            aria-controls="tabpanel-0" 
          />
          <Tab 
            icon={
              <Badge badgeContent={errorCount} color="error" invisible={errorCount === 0}>
                <OutputIcon />
              </Badge>
            } 
            label="Results" 
            id="tab-1" 
            aria-controls="tabpanel-1" 
          />
        </Tabs>
      </Box>
      
      <PanelContent>
        <TabPanel value={tabIndex} index={0}>
          <NodeConfiguration />
        </TabPanel>
        
        <TabPanel value={tabIndex} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={1} pb={0}>
            <Typography variant="caption" color="textSecondary">
              {executionStatus === 'idle' 
                ? 'Not executed yet' 
                : `Status: ${executionStatus.charAt(0).toUpperCase()}${executionStatus.slice(1)}`}
            </Typography>
            
            <Button 
              size="small" 
              color="primary" 
              onClick={handleRunExecution}
              disabled={isExecuting}
              variant="contained"
              startIcon={isExecuting ? <CircularProgress size={16} /> : <PlayArrowIcon fontSize="small" />}
            >
              {isExecuting ? 'Running...' : 'Run Graph'}
            </Button>
          </Box>
          
          <Divider sx={{ mb: 1 }} />
          
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {renderResultContent()}
          </Box>
        </TabPanel>
      </PanelContent>
    </PanelContainer>
  );
};

export default ResultsPanel; 