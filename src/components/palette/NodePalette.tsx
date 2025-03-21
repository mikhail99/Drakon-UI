import React, { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { nodeTypes as allNodeTypes } from '../../utils/nodeTypes';
import { NodeType } from '../../types/node';
import { useTemplateStore } from '../../store/templateStore';
import { getNodeTypesForTemplate } from '../../utils/projectTemplates';

// Styled components
const PaletteContainer = styled(Paper)(({ theme }) => ({
  width: 240,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CategoriesContainer = styled(Box)({
  flex: 1,
  overflowY: 'auto',
});

const DraggableNode = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: theme.spacing(0.5, 0),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  cursor: 'grab',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:active': {
    cursor: 'grabbing',
  },
}));

const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Get the active template from the store
  const { activeTemplateId } = useTemplateStore();
  
  // Get the node types based on the active template
  const templateNodeTypes = useMemo(() => {
    return getNodeTypesForTemplate(activeTemplateId);
  }, [activeTemplateId]);
  
  // Get node categories based on template
  const nodeCategories = useMemo(() => {
    return [...new Set(Object.values(templateNodeTypes).map(type => type.category))];
  }, [templateNodeTypes]);
  
  // Group node types by category based on template
  const nodeTypesByCategory = useMemo(() => {
    return nodeCategories.reduce((acc, category) => {
      acc[category] = Object.values(templateNodeTypes).filter(type => type.category === category);
      return acc;
    }, {} as Record<string, NodeType[]>);
  }, [nodeCategories, templateNodeTypes]);

  const filteredCategories = useMemo(() => {
    return nodeCategories.map((categoryName) => {
      const categoryNodes = nodeTypesByCategory[categoryName];
      return {
        name: categoryName,
        nodes: categoryNodes.filter(node =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      };
    }).filter(category => category.nodes.length > 0);
  }, [searchTerm, nodeCategories, nodeTypesByCategory]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(name => name !== categoryName);
      }
      return [...prev, categoryName];
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    console.log('Drag started for node:', nodeType.label);
    
    // Set basic text data first (for better compatibility)
    event.dataTransfer.setData('text/plain', nodeType.label);
    
    // Set custom data format with stringified node type information
    const data = {
      type: 'node',
      nodeType
    };
    
    try {
      const jsonData = JSON.stringify(data);
      event.dataTransfer.setData('application/drakon-node', jsonData);
      
      // Add backup data formats for better browser compatibility
      event.dataTransfer.setData('application/json', jsonData);
      
      // Set drag effect and image
      event.dataTransfer.effectAllowed = 'move';
      
      console.log('Drag data set successfully');
    } catch (error) {
      console.error('Error setting drag data:', error);
    }
  };

  return (
    <PaletteContainer>
      <SearchContainer>
        <TextField
          fullWidth
          size="small"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </SearchContainer>

      <CategoriesContainer>
        {filteredCategories.map((category) => (
          <Accordion
            key={category.name}
            expanded={expandedCategories.includes(category.name)}
            onChange={() => toggleCategory(category.name)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{category.name}</Typography>
              <Chip size="small" label={category.nodes.length} />
            </AccordionSummary>
            <AccordionDetails>
              {category.nodes.map((nodeType) => (
                <DraggableNode
                  key={nodeType.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType)}
                >
                  <Typography>{nodeType.label}</Typography>
                </DraggableNode>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </CategoriesContainer>
    </PaletteContainer>
  );
};

export default NodePalette; 