import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { useGraphStore } from '../../store/graphStore';
import { NodeType, CustomNode } from '../../types/node';

interface NodeTreeViewProps {
  onAddNode?: (nodeType: NodeType) => void;
  onConfigureNode?: (nodeId: string) => void;
}

/**
 * NodeTreeView component displays a flat list of nodes in the current graph
 */
const NodeTreeView: React.FC<NodeTreeViewProps> = ({ onConfigureNode }) => {
  const { nodes } = useGraphStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get filtered nodes that match the search term
  const getFilteredNodes = () => {
    if (!searchTerm) return nodes;
    
    return nodes.filter(
      (node) => 
        (node.data.label && node.data.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.id && node.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };
  
  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // Handle configuration of a node
  const handleConfigureNode = (nodeId: string) => {
    if (onConfigureNode) {
      onConfigureNode(nodeId);
    }
  };
  
  const filteredNodes = getFilteredNodes();
  
  // Log nodes for debugging
  console.log('Nodes in TreeView:', nodes.map(node => ({
    id: node.id,
    type: node.type,
    label: node.data.label,
    fullData: node.data
  })));
  
  // Function to extract the most user-friendly name from a node
  const getNodeName = (node: CustomNode): string => {
    console.log(`Node ${node.id} has label:`, node.data.label);
    
    // Otherwise, return the node's label as-is
    return node.data.label || node.id;
  };
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: 280, 
        flexShrink: 0, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        borderLeft: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        overflow: 'auto'
      }}
    >
      <Box sx={{ 
        p: 1, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle1">Node View</Typography>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
      </Box>
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {filteredNodes.length > 0 ? (
          <List dense disablePadding>
            {filteredNodes.map((node) => (
              <ListItemButton 
                key={node.id}
                sx={{ pl: 2 }}
                dense
                onClick={() => handleConfigureNode(node.id)}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 'medium' }}>
                        {getNodeName(node)}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfigureNode(node.id);
                        }}
                        sx={{ 
                          opacity: 0.5, 
                          '&:hover': { opacity: 1 } 
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No nodes match your search' : 'No nodes in the graph'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default NodeTreeView; 