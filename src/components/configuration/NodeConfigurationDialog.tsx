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
} from '@mui/material';
import { Node } from 'reactflow';
import { CustomNode, NodeData } from '../../types/node';
import { useGraphStore } from '../../store/graphStore';

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
  const { nodes, updateNodeConfig } = useGraphStore();
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

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {selectedNode ? `Configure: ${selectedNode.data.label}` : 'Node Configuration'}
      </DialogTitle>
      
      <DialogContent dividers>
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
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          onClick={handleApply} 
          variant="contained" 
          color="primary"
          disabled={!selectedNode}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeConfigurationDialog; 