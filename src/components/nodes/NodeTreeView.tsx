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
  ListItemIcon,
  Collapse,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useGraphStore } from '../../store/graphStore';
import { useNodeOrganizationStore } from '../../store/nodeOrganizationStore';
import { NodeType, CustomNode, NodeFolder } from '../../types/node';

interface NodeTreeViewProps {
  onAddNode?: (nodeType: NodeType) => void;
  onConfigureNode?: (nodeId: string) => void;
}

/**
 * NodeTreeView component displays nodes organized in folders
 */
const NodeTreeView: React.FC<NodeTreeViewProps> = ({ onConfigureNode }) => {
  const { nodes } = useGraphStore();
  const {
    folders,
    nodeToFolder,
    getRootFolders,
    getFolder,
    getFolderNodes,
    addFolder,
    renameFolder,
    deleteFolder,
    moveNodeToFolder,
    addNodeToFolder
  } = useNodeOrganizationStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'default': true
  });
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuType, setContextMenuType] = useState<'folder' | 'node' | null>(null);
  const [contextNodeId, setContextNodeId] = useState<string | null>(null);
  
  // Toggle a folder's expanded state
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Open menu for folder or node
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    type: 'folder' | 'node',
    id: string
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setContextMenuType(type);
    if (type === 'folder') {
      setActiveFolderId(id);
    } else {
      setContextNodeId(id);
    }
  };
  
  // Close context menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setContextMenuType(null);
    setActiveFolderId(null);
    setContextNodeId(null);
  };
  
  // Handle creating a new folder
  const handleCreateFolder = () => {
    setNewFolderName('');
    setCreateFolderOpen(true);
  };
  
  // Handle saving a new folder
  const handleSaveNewFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName, activeFolderId);
      setCreateFolderOpen(false);
      setNewFolderName('');
      
      // Expand the parent folder if a subfolder is created
      if (activeFolderId) {
        setExpandedFolders(prev => ({
          ...prev,
          [activeFolderId]: true
        }));
      }
    }
  };
  
  // Handle renaming a folder
  const handleRenameFolder = () => {
    if (activeFolderId) {
      const folder = getFolder(activeFolderId);
      if (folder) {
        setNewFolderName(folder.name);
        setRenameFolderOpen(true);
        handleCloseMenu();
      }
    }
  };
  
  // Handle saving a renamed folder
  const handleSaveRenamedFolder = () => {
    if (activeFolderId && newFolderName.trim()) {
      renameFolder(activeFolderId, newFolderName);
      setRenameFolderOpen(false);
      setNewFolderName('');
    }
  };
  
  // Handle deleting a folder
  const handleDeleteFolder = () => {
    if (activeFolderId) {
      deleteFolder(activeFolderId);
      handleCloseMenu();
    }
  };
  
  // Handle moving a node to a folder
  const handleMoveNodeToFolder = (targetFolderId: string) => {
    if (contextNodeId) {
      moveNodeToFolder(contextNodeId, targetFolderId);
      handleCloseMenu();
    }
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
  
  // Function to extract the most user-friendly name from a node
  const getNodeName = (node: CustomNode): string => {
    return node.data.label || node.id;
  };
  
  // Filter nodes based on search term
  const filteredNodes = searchTerm
    ? nodes.filter(node => 
        node.data.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : nodes;
  
  // Group nodes by folder
  const nodesByFolder = Object.values(folders).reduce<Record<string, CustomNode[]>>(
    (acc, folder) => {
      acc[folder.id] = folder.nodeIds
        .map(nodeId => nodes.find(node => node.id === nodeId))
        .filter(Boolean) as CustomNode[];
      return acc;
    },
    {}
  );
  
  // Find nodes not in any folder
  const unorganizedNodes = nodes.filter(node => !nodeToFolder[node.id]);
  
  // If there are unorganized nodes, add them to default folder
  if (unorganizedNodes.length > 0) {
    unorganizedNodes.forEach(node => {
      addNodeToFolder(node.id, 'default');
    });
  }
  
  // When searching, expand all folders
  React.useEffect(() => {
    if (searchTerm) {
      const allFolders = Object.keys(folders);
      const expandAll = allFolders.reduce<Record<string, boolean>>((acc, folderId) => {
        acc[folderId] = true;
        return acc;
      }, {});
      
      setExpandedFolders(expandAll);
    }
  }, [searchTerm, folders]);
  
  // Recursive component to render a folder and its subfolders
  const renderFolder = (folder: NodeFolder) => {
    const isExpanded = !!expandedFolders[folder.id];
    const folderNodes = nodesByFolder[folder.id] || [];
    
    // Filter nodes in this folder based on search term
    const filteredFolderNodes = searchTerm
      ? folderNodes.filter(node => 
          node.data.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : folderNodes;
    
    // Get all subfolders
    const subfolders = Object.values(folders).filter(
      subfolder => subfolder.parentId === folder.id
    );
    
    // Hide empty folders when searching
    if (searchTerm && filteredFolderNodes.length === 0 && subfolders.length === 0) {
      return null;
    }
    
    return (
      <React.Fragment key={folder.id}>
        <ListItemButton 
          onClick={() => toggleFolder(folder.id)}
          sx={{ 
            pl: folder.parentId ? 4 : 2,
            pr: 1
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {isExpanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
          </ListItemIcon>
          
          <ListItemText 
            primary={
              <Typography variant="body2" noWrap sx={{ fontWeight: 'medium' }}>
                {folder.name} {filteredFolderNodes.length > 0 && `(${filteredFolderNodes.length})`}
              </Typography>
            } 
          />
          
          <Box sx={{ display: 'flex' }}>
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, 'folder', folder.id)}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </ListItemButton>
        
        <Collapse in={isExpanded} timeout="auto">
          {/* Nodes in this folder */}
          {filteredFolderNodes.map((node) => (
            <ListItemButton 
              key={node.id}
              sx={{ pl: folder.parentId ? 6 : 4 }}
              dense
              onClick={() => handleConfigureNode(node.id)}
            >
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" noWrap>
                      {getNodeName(node)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(e, 'node', node.id);
                        }}
                      >
                        <DragIndicatorIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfigureNode(node.id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                }
              />
            </ListItemButton>
          ))}
          
          {/* Render subfolders */}
          {subfolders.map(subfolder => renderFolder(subfolder))}
        </Collapse>
      </React.Fragment>
    );
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
        
        <Tooltip title="Create folder">
          <IconButton size="small" onClick={handleCreateFolder}>
            <CreateNewFolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
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
        {nodes.length > 0 ? (
          <List dense disablePadding>
            {getRootFolders().map(renderFolder)}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No nodes match your search' : 'No nodes in the graph'}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Folder Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl) && contextMenuType === 'folder'}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleCreateFolder}>
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Subfolder</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRenameFolder}>
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Folder</ListItemText>
        </MenuItem>
        {activeFolderId !== 'default' && (
          <MenuItem onClick={handleDeleteFolder}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Folder</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Node Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl) && contextMenuType === 'node'}
        onClose={handleCloseMenu}
      >
        <MenuItem disabled>
          <ListItemText>Move to folder:</ListItemText>
        </MenuItem>
        <Divider />
        {Object.values(folders).map(folder => (
          <MenuItem 
            key={folder.id}
            onClick={() => handleMoveNodeToFolder(folder.id)}
            disabled={nodeToFolder[contextNodeId || ''] === folder.id}
          >
            <ListItemIcon>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{folder.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
      
      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNewFolder} disabled={!newFolderName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderOpen} onClose={() => setRenameFolderOpen(false)}>
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameFolderOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRenamedFolder} disabled={!newFolderName.trim()}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NodeTreeView; 