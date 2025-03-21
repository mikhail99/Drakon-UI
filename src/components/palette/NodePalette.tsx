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
import { nodeCategories, nodeTypesByCategory } from '../../utils/nodeTypes';
import { NodeType } from '../../types/node';

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

const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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
  }, [searchTerm]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(name => name !== categoryName);
      }
      return [...prev, categoryName];
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/draggable-node', JSON.stringify({
      type: 'node',
      nodeType
    }));
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
                <Box
                  key={nodeType.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType)}
                >
                  <Typography>{nodeType.label}</Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </CategoriesContainer>
    </PaletteContainer>
  );
};

export default NodePalette; 