import React, { useState, useCallback, useMemo } from 'react';
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
  Tooltip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { nodeCategories, nodeTypesByCategory } from '../../utils/nodeTypes';
import { NodeType } from '../../types/node';
import useGraphStore from '../../store/graphStore';

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

const NodeItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.9rem',
}));

const FavoritesSection = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

interface DragItem {
  type: string;
  nodeType: NodeType;
}

const NodePalette: React.FC = () => {
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('node-favorites', []);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(nodeCategories);
  const { addNode } = useGraphStore();

  // Filter nodes based on search
  const filteredNodeTypes = useMemo(() => {
    if (!search) return nodeTypesByCategory;

    const searchLower = search.toLowerCase();
    const filtered: Record<string, NodeType[]> = {};

    Object.entries(nodeTypesByCategory).forEach(([category, types]) => {
      const matchingTypes = types.filter(
        (type) =>
          type.label.toLowerCase().includes(searchLower) ||
          type.description?.toLowerCase().includes(searchLower)
      );

      if (matchingTypes.length > 0) {
        filtered[category] = matchingTypes;
      }
    });

    return filtered;
  }, [search]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (nodeTypeId: string) => {
      setFavorites((prev: string[]) =>
        prev.includes(nodeTypeId)
          ? prev.filter((id: string) => id !== nodeTypeId)
          : [...prev, nodeTypeId]
      );
    },
    [setFavorites]
  );

  // Get favorite node types
  const favoriteNodeTypes = useMemo(() => {
    return Object.values(nodeTypesByCategory)
      .flat()
      .filter((nodeType) => favorites.includes(nodeType.id));
  }, [favorites]);

  // Handle node dragging to add it to the graph
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    // Set the drag data
    event.dataTransfer.setData(
      'application/drakon-node',
      JSON.stringify({
        type: nodeType.id,
        nodeType,
      } as DragItem)
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <PaletteContainer elevation={1}>
      <SearchContainer>
        <TextField
          fullWidth
          size="small"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </SearchContainer>

      <CategoriesContainer>
        {/* Favorites section */}
        {favoriteNodeTypes.length > 0 && (
          <FavoritesSection>
            <Box display="flex" alignItems="center" mb={1}>
              <StarIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="subtitle2">Favorites</Typography>
            </Box>
            {favoriteNodeTypes.map((nodeType) => (
              <NodeItem
                key={nodeType.id}
                draggable
                onDragStart={(e) => handleDragStart(e, nodeType)}
              >
                <Tooltip title={nodeType.description || nodeType.label}>
                  <Typography variant="body2">{nodeType.label}</Typography>
                </Tooltip>
                <StarIcon
                  color="warning"
                  fontSize="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(nodeType.id);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </NodeItem>
            ))}
            <Divider sx={{ my: 1 }} />
          </FavoritesSection>
        )}

        {/* Categories with their node types */}
        {Object.entries(filteredNodeTypes).map(([category, types]) => (
          <Accordion
            key={category}
            expanded={expandedCategories.includes(category)}
            onChange={() => toggleCategory(category)}
            disableGutters
            elevation={0}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <CategoryTitle>{category}</CategoryTitle>
              <Chip
                label={types.length}
                size="small"
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
              />
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 1 }}>
              {types.map((nodeType) => (
                <NodeItem
                  key={nodeType.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType)}
                >
                  <Tooltip title={nodeType.description || nodeType.label}>
                    <Typography variant="body2">{nodeType.label}</Typography>
                  </Tooltip>
                  {favorites.includes(nodeType.id) ? (
                    <StarIcon
                      color="warning"
                      fontSize="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(nodeType.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <StarBorderIcon
                      fontSize="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(nodeType.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </NodeItem>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </CategoriesContainer>
    </PaletteContainer>
  );
};

export default NodePalette; 