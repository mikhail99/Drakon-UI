import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Switch,
  Slider,
  Divider,
  FormGroup,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Node } from 'reactflow';
import SettingsIcon from '@mui/icons-material/Settings';
import OutputIcon from '@mui/icons-material/BarChart';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ErrorIcon from '@mui/icons-material/Error';

import { CustomNode, NodeData } from '../../types/node';
import { useGraphStore } from '../../store/graphStore';
import { useExecutionStore } from '../../store/executionStore';
import TextJsonViewer from '../results/TextJsonViewer';
import TableViewer from '../results/TableViewer';
import ValueDisplay from '../results/ValueDisplay';

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

interface NodeConfigurationDialogProps {
  open: boolean;
  nodeId: string | null;
  onClose: () => void;
}

const NodeConfigurationDialog: React.FC<NodeConfigurationDialogProps> = ({
  open,
  nodeId,
  onClose,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { nodes, updateNodeConfig } = useGraphStore();
  const { results, executionStatus, isExecuting, runMockExecution } = useExecutionStore();
  
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  // Get the selected node when nodeId changes
  useEffect(() => {
    if (nodeId) {
      const node = nodes.find((n: Node<NodeData>) => n.id === nodeId);
      setSelectedNode(node || null);
      setConfigValues(node ? { ...node.data.config } : {});
    } else {
      setSelectedNode(null);
      setConfigValues({});
    }
  }, [nodeId, nodes]);

  // Handle config value changes
  const handleConfigChange = <K extends keyof typeof configValues>(
    key: K,
    value: (typeof configValues)[K]
  ) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Apply changes to the node and close the dialog
  const handleApply = () => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, configValues);
    }
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };
  
  // Handle run execution
  const handleRunExecution = () => {
    runMockExecution();
  };

  // Get node result
  const selectedNodeResult = nodeId ? results[nodeId] : null;
  
  // Count errors
  const errorCount = Object.values(results).filter(r => r.status === 'error').length;

  // Render results content based on data type
  const renderResultContent = () => {
    if (!selectedNodeResult) {
      return (
        <Box p={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body2" color="textSecondary" align="center">
            {Object.keys(results).length === 0
              ? 'Run the graph to see execution results'
              : 'No results available for this node'}
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
    const nodeInfo = nodes.find(n => n.id === nodeId);
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
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedNode ? `${selectedNode.data.label}` : 'Node Details'}
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="node details tabs"
        >
          <Tab 
            icon={<SettingsIcon />} 
            label="Configure" 
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
      
      <DialogContent dividers sx={{ height: '400px', overflow: 'auto' }}>
        <TabPanel value={tabIndex} index={0}>
          {!selectedNode ? (
            <Typography variant="body2" color="textSecondary">
              No node selected.
            </Typography>
          ) : (
            <Box sx={{ py: 1 }}>
              {/* Node Label */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Label"
                  value={configValues.label || selectedNode.data.label}
                  onChange={(e) => handleConfigChange('label', e.target.value)}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Render different config fields based on node type */}
              {selectedNode.data.type && selectedNode.data.type.startsWith('io.input') && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Default Value"
                    value={configValues.defaultValue || ''}
                    onChange={(e) => handleConfigChange('defaultValue', e.target.value)}
                    size="small"
                  />
                </Box>
              )}

              {/* Number configuration for math nodes */}
              {selectedNode.data.type && selectedNode.data.type.startsWith('math.') && (
                <FormGroup>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configValues.useInteger || false}
                          onChange={(e) => handleConfigChange('useInteger', e.target.checked)}
                        />
                      }
                      label="Use Integer Values"
                    />
                  </Box>
                  {configValues.useInteger && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Decimal Places
                      </Typography>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        value={configValues.decimalPlaces || 2}
                        onChange={(_, value) => handleConfigChange('decimalPlaces', value)}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}
                </FormGroup>
              )}
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabIndex} index={1}>
          {renderResultContent()}
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          onClick={handleApply} 
          variant="contained" 
          color="primary"
          disabled={!selectedNode || tabIndex !== 0}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeConfigurationDialog; 