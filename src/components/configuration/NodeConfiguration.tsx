import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Typography,
  Box,
  TextField,
  Switch,
  Slider,
  Divider,
  FormGroup,
  FormControlLabel,
  Button,
} from '@mui/material';
import { Node } from 'reactflow';
import { CustomNode, NodeData } from '../../types/node';
import { useGraphStore } from '../../store/graphStore';

const ConfigContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: 'auto',
  flex: 1,
  height: '100%',
}));

const ConfigField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const NodeConfiguration: React.FC = () => {
  const { selectedElements, nodes, updateNodeConfig } = useGraphStore();
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  // Get the selected node when selection changes
  useEffect(() => {
    if (selectedElements.nodes.length === 1) {
      const node = nodes.find((n: Node<NodeData>) => n.id === selectedElements.nodes[0]);
      setSelectedNode(node || null);
      setConfigValues(node ? { ...node.data.config } : {});
    } else {
      setSelectedNode(null);
      setConfigValues({});
    }
  }, [selectedElements, nodes]);

  // Handle config value changes
  const handleConfigChange = <K extends keyof typeof configValues>(
    key: K,
    value: (typeof configValues)[K]
  ) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  // Apply changes to the node
  const applyChanges = () => {
    if (selectedNode) {
      updateNodeConfig(selectedNode.id, configValues);
    }
  };

  if (!selectedNode) {
    return (
      <ConfigContent>
        <Typography variant="body2" color="textSecondary">
          Select a node to configure it.
        </Typography>
      </ConfigContent>
    );
  }

  return (
    <ConfigContent>
      {/* Node Label */}
      <ConfigField>
        <TextField
          fullWidth
          label="Label"
          value={configValues.label || selectedNode.data.label}
          onChange={(e) => handleConfigChange('label', e.target.value)}
          size="small"
        />
      </ConfigField>

      <Divider sx={{ my: 2 }} />

      {/* Render different config fields based on node type */}
      {selectedNode.data.type && selectedNode.data.type.startsWith('io.input') && (
        <ConfigField>
          <TextField
            fullWidth
            label="Default Value"
            value={configValues.defaultValue || ''}
            onChange={(e) => handleConfigChange('defaultValue', e.target.value)}
            size="small"
          />
        </ConfigField>
      )}

      {/* Number configuration for math nodes */}
      {selectedNode.data.type && selectedNode.data.type.startsWith('math.') && (
        <FormGroup>
          <ConfigField>
            <FormControlLabel
              control={
                <Switch
                  checked={configValues.useInteger || false}
                  onChange={(e) => handleConfigChange('useInteger', e.target.checked)}
                />
              }
              label="Use Integer Values"
            />
          </ConfigField>
          {configValues.useInteger && (
            <ConfigField>
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
            </ConfigField>
          )}
        </FormGroup>
      )}

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={applyChanges}>
          Apply
        </Button>
      </Box>
    </ConfigContent>
  );
};

export default NodeConfiguration; 