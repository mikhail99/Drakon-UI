import React, { useState, useCallback } from 'react';
import { 
  Box, List, ListItem, ListItemText, Collapse, TextField,
  IconButton, Tooltip, Typography, Divider, InputAdornment,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Node } from 'reactflow';
import { NodeData, PortDefinition } from '../types/node';
import useGraphStore from '../store/graphStore';

interface NodeType {
  type: string;
  label: string;
  description: string;
  category: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

// Node types catalog
const nodeTypes: NodeType[] = [
  {
    type: 'numberInput',
    label: 'Number Input',
    description: 'Provides a numerical input value',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'output', label: 'Value', type: 'number' }]
  },
  {
    type: 'textInput',
    label: 'Text Input',
    description: 'Provides a text input value',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'output', label: 'Value', type: 'string' }]
  },
  {
    type: 'booleanInput',
    label: 'Boolean Input',
    description: 'Provides a true/false input value',
    category: 'Input',
    inputs: [],
    outputs: [{ id: 'output', label: 'Value', type: 'boolean' }]
  },
  {
    type: 'mathOperation',
    label: 'Math Operation',
    description: 'Performs basic math operations',
    category: 'Process',
    inputs: [
      { id: 'a', label: 'A', type: 'number' },
      { id: 'b', label: 'B', type: 'number' }
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'number' }]
  },
  {
    type: 'stringOperation',
    label: 'String Operation',
    description: 'Performs string operations like concatenation',
    category: 'Process',
    inputs: [
      { id: 'a', label: 'A', type: 'string' },
      { id: 'b', label: 'B', type: 'string' }
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'string' }]
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Evaluates a condition and routes accordingly',
    category: 'Process',
    inputs: [
      { id: 'condition', label: 'Condition', type: 'boolean' },
      { id: 'true', label: 'If True', type: 'any' },
      { id: 'false', label: 'If False', type: 'any' }
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'any' }]
  },
  {
    type: 'numberOutput',
    label: 'Number Output',
    description: 'Displays a numerical output value',
    category: 'Output',
    inputs: [{ id: 'input', label: 'Value', type: 'number' }],
    outputs: []
  },
  {
    type: 'textOutput',
    label: 'Text Output',
    description: 'Displays a text output value',
    category: 'Output',
    inputs: [{ id: 'input', label: 'Value', type: 'string' }],
    outputs: []
  },
  {
    type: 'visualOutput',
    label: 'Visual Output',
    description: 'Displays a chart or visualization',
    category: 'Output',
    inputs: [{ id: 'data', label: 'Data', type: 'any' }],
    outputs: []
  }
];

export const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode } = useGraphStore();

  // Group nodes by category
  const nodesByCategory = nodeTypes.reduce<Record<string, NodeType[]>>((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {});

  const toggleCategory = (category: string) => {
    setExpanded(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    const nodeData = {
      type: 'custom',
      data: {
        label: nodeType.label,
        type: nodeType.type,
        inputs: nodeType.inputs,
        outputs: nodeType.outputs,
        config: {}
      }
    };
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDoubleClick = (nodeType: NodeType) => {
    const newNode: Node<NodeData> = {
      id: `${nodeType.type}-${Date.now()}`,
      type: 'custom',
      position: {
        x: 100,
        y: 100
      },
      data: {
        label: nodeType.label,
        type: nodeType.type,
        inputs: nodeType.inputs,
        outputs: nodeType.outputs,
        config: {}
      }
    };
    
    addNode(newNode);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
    // Expand all categories when searching
    if (event.target.value) {
      setExpanded(Object.keys(nodesByCategory));
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setExpanded([]);
  };

  // Filter nodes based on search term
  const filteredNodeTypes = searchTerm
    ? nodeTypes.filter(node => 
        node.label.toLowerCase().includes(searchTerm) || 
        node.description.toLowerCase().includes(searchTerm))
    : nodeTypes;

  // Group filtered nodes by category
  const filteredNodesByCategory = filteredNodeTypes.reduce<Record<string, NodeType[]>>((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {});

  return (
    <Paper elevation={2} sx={{ height: '100%', overflow: 'auto' }}>
      <Box p={2}>
        <TextField
          fullWidth
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
      </Box>
      
      <Divider />
      
      <List component="nav" aria-label="node categories">
        {Object.keys(filteredNodesByCategory).length > 0 ? (
          Object.entries(filteredNodesByCategory).map(([category, nodes]) => (
            <React.Fragment key={category}>
              <ListItem button onClick={() => toggleCategory(category)}>
                <ListItemText primary={category} />
                {expanded.includes(category) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              
              <Collapse in={expanded.includes(category)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {nodes.map((node) => (
                    <Tooltip
                      key={node.type}
                      title={node.description}
                      placement="right"
                      arrow
                    >
                      <ListItem
                        button
                        sx={{ pl: 4 }}
                        draggable
                        onDragStart={(e) => onDragStart(e, node)}
                        onDoubleClick={() => onDoubleClick(node)}
                      >
                        <ListItemText primary={node.label} />
                      </ListItem>
                    </Tooltip>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No results" secondary="Try a different search term" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}; 