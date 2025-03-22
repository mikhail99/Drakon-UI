import { create } from 'zustand';
import { NodeFolder, NodeOrganization } from '../types/node';

/**
 * Store for managing node folders and organization
 */
interface NodeOrganizationState extends NodeOrganization {
  // Add a new folder
  addFolder: (name: string, parentId?: string | null) => string;
  
  // Rename a folder
  renameFolder: (folderId: string, newName: string) => void;
  
  // Delete a folder (and optionally its nodes)
  deleteFolder: (folderId: string, deleteNodes?: boolean) => void;
  
  // Move a folder to a new parent
  moveFolder: (folderId: string, newParentId: string | null) => void;
  
  // Add a node to a folder
  addNodeToFolder: (nodeId: string, folderId: string) => void;
  
  // Remove a node from its folder
  removeNodeFromFolder: (nodeId: string) => void;
  
  // Move a node to a different folder
  moveNodeToFolder: (nodeId: string, folderId: string) => void;
  
  // Get all nodes in a folder (including subfolders if specified)
  getFolderNodes: (folderId: string, includeSubfolders?: boolean) => string[];
  
  // Get a folder by ID
  getFolder: (folderId: string) => NodeFolder | undefined;
  
  // Get the folder ID for a node
  getNodeFolder: (nodeId: string) => string | undefined;
  
  // Get all root folders (folders without a parent)
  getRootFolders: () => NodeFolder[];
  
  // Check if a folder has subfolders
  hasSubfolders: (folderId: string) => boolean;
  
  // Get subfolders for a folder
  getSubfolders: (folderId: string) => NodeFolder[];
}

/**
 * Node organization store for managing folders and node organization
 */
export const useNodeOrganizationStore = create<NodeOrganizationState>((set, get) => ({
  // Initial state
  folders: {
    'default': {
      id: 'default',
      name: 'Default Folder',
      nodeIds: [],
    }
  },
  nodeToFolder: {},
  
  // Add a new folder
  addFolder: (name, parentId = null) => {
    const folderId = `folder-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    set((state) => ({
      folders: {
        ...state.folders,
        [folderId]: {
          id: folderId,
          name,
          parentId,
          nodeIds: [],
        }
      }
    }));
    
    return folderId;
  },
  
  // Rename a folder
  renameFolder: (folderId, newName) => {
    set((state) => {
      const folder = state.folders[folderId];
      if (!folder) return state;
      
      return {
        folders: {
          ...state.folders,
          [folderId]: {
            ...folder,
            name: newName,
          }
        }
      };
    });
  },
  
  // Delete a folder (and optionally its nodes)
  deleteFolder: (folderId, deleteNodes = false) => {
    set((state) => {
      const folder = state.folders[folderId];
      if (!folder) return state;
      
      // Create a copy of folders without the deleted folder
      const { [folderId]: deletedFolder, ...restFolders } = state.folders;
      
      // Update nodeToFolder mapping
      const newNodeToFolder = { ...state.nodeToFolder };
      
      // Remove all node mappings for this folder
      folder.nodeIds.forEach(nodeId => {
        delete newNodeToFolder[nodeId];
      });
      
      // Move subfolders to root if the folder is deleted
      Object.values(restFolders).forEach(subfolder => {
        if (subfolder.parentId === folderId) {
          subfolder.parentId = null;
        }
      });
      
      return {
        folders: restFolders,
        nodeToFolder: newNodeToFolder,
      };
    });
  },
  
  // Move a folder to a new parent
  moveFolder: (folderId: string, newParentId: string | null): void => {
    set((state) => {
      const folder = state.folders[folderId];
      if (!folder) return state;
      
      // Prevent circular references
      if (folderId === newParentId) return state;
      
      // Check for circular references up the chain
      let current = newParentId;
      while (current) {
        if (current === folderId) return state; // Would create a loop
        const parent = state.folders[current];
        if (!parent) break;
        current = parent.parentId || null;
      }
      
      return {
        folders: {
          ...state.folders,
          [folderId]: {
            ...folder,
            parentId: newParentId,
          }
        }
      };
    });
  },
  
  // Add a node to a folder
  addNodeToFolder: (nodeId, folderId) => {
    set((state) => {
      const folder = state.folders[folderId];
      if (!folder) return state;
      
      // Remove from previous folder if any
      const prevFolderId = state.nodeToFolder[nodeId];
      let updatedFolders = { ...state.folders };
      
      if (prevFolderId && prevFolderId !== folderId) {
        const prevFolder = state.folders[prevFolderId];
        if (prevFolder) {
          updatedFolders[prevFolderId] = {
            ...prevFolder,
            nodeIds: prevFolder.nodeIds.filter(id => id !== nodeId)
          };
        }
      }
      
      return {
        folders: {
          ...updatedFolders,
          [folderId]: {
            ...folder,
            nodeIds: [...folder.nodeIds, nodeId]
          }
        },
        nodeToFolder: {
          ...state.nodeToFolder,
          [nodeId]: folderId
        }
      };
    });
  },
  
  // Remove a node from its folder
  removeNodeFromFolder: (nodeId) => {
    set((state) => {
      const folderId = state.nodeToFolder[nodeId];
      if (!folderId) return state;
      
      const folder = state.folders[folderId];
      if (!folder) return state;
      
      const updatedNodeToFolder = { ...state.nodeToFolder };
      delete updatedNodeToFolder[nodeId];
      
      return {
        folders: {
          ...state.folders,
          [folderId]: {
            ...folder,
            nodeIds: folder.nodeIds.filter(id => id !== nodeId)
          }
        },
        nodeToFolder: updatedNodeToFolder
      };
    });
  },
  
  // Move a node to a different folder
  moveNodeToFolder: (nodeId, folderId) => {
    // First remove from current folder, then add to new one
    get().removeNodeFromFolder(nodeId);
    get().addNodeToFolder(nodeId, folderId);
  },
  
  // Get all nodes in a folder (including subfolders if specified)
  getFolderNodes: (folderId, includeSubfolders = false) => {
    const state = get();
    const folder = state.folders[folderId];
    if (!folder) return [];
    
    let nodeIds = [...folder.nodeIds];
    
    if (includeSubfolders) {
      // Get all subfolders recursively
      const subfolders = state.getSubfolders(folderId);
      subfolders.forEach(subfolder => {
        nodeIds = [...nodeIds, ...subfolder.nodeIds];
      });
    }
    
    return nodeIds;
  },
  
  // Get a folder by ID
  getFolder: (folderId) => {
    return get().folders[folderId];
  },
  
  // Get the folder ID for a node
  getNodeFolder: (nodeId) => {
    return get().nodeToFolder[nodeId];
  },
  
  // Get all root folders (folders without a parent)
  getRootFolders: () => {
    const folders = get().folders;
    return Object.values(folders).filter(folder => !folder.parentId);
  },
  
  // Check if a folder has subfolders
  hasSubfolders: (folderId) => {
    const folders = get().folders;
    return Object.values(folders).some(folder => folder.parentId === folderId);
  },
  
  // Get subfolders for a folder
  getSubfolders: (folderId) => {
    const folders = get().folders;
    const directSubfolders = Object.values(folders).filter(folder => folder.parentId === folderId);
    
    // Get all subfolders recursively
    let allSubfolders = [...directSubfolders];
    directSubfolders.forEach(subfolder => {
      const childSubfolders = get().getSubfolders(subfolder.id);
      allSubfolders = [...allSubfolders, ...childSubfolders];
    });
    
    return allSubfolders;
  }
})); 