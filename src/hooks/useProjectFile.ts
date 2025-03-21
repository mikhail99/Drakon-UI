import { useState, useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { graphEvents, GRAPH_EVENTS } from '../utils/eventEmitter';

/**
 * Hook for managing project file operations
 * Provides methods for creating, loading, and saving projects
 */
export const useProjectFile = () => {
  const { nodes, edges, clear } = useGraphStore();
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Listen for graph change events
  useEffect(() => {
    const handleGraphChanged = () => {
      setHasUnsavedChanges(true);
    };

    graphEvents.on(GRAPH_EVENTS.GRAPH_CHANGED, handleGraphChanged);

    return () => {
      graphEvents.off(GRAPH_EVENTS.GRAPH_CHANGED, handleGraphChanged);
    };
  }, []);

  // Check if there are elements in the graph
  const hasContent = () => {
    return nodes.length > 0 || edges.length > 0;
  };

  // Create a new project
  const createNewProject = () => {
    clear();
    setCurrentFilePath(null);
    setHasUnsavedChanges(false);
  };

  // Open a project file
  const openProject = (file: File) => {
    const reader = new FileReader();
    
    return new Promise<boolean>((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const projectData = JSON.parse(result);
          
          // Load the project data into the store
          clear(); // First clear existing graph
          
          // Check if the file has valid node and edge data
          if (Array.isArray(projectData.nodes) && Array.isArray(projectData.edges)) {
            // Add nodes first
            projectData.nodes.forEach((node: any) => {
              useGraphStore.getState().addNode(node);
            });
            
            // Then add edges
            projectData.edges.forEach((edge: any) => {
              useGraphStore.getState().onConnect(edge);
            });
            
            // Set the current file path
            setCurrentFilePath(file.name);
            setHasUnsavedChanges(false);
            resolve(true);
          } else {
            reject(new Error('Invalid project file format'));
          }
        } catch (error) {
          console.error('Error loading project:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the file'));
      };
      
      reader.readAsText(file);
    });
  };

  // Save the project to a file
  const saveProject = (filename?: string) => {
    const { nodes, edges } = useGraphStore.getState();
    const projectData = {
      nodes,
      edges,
      version: '1.0.0', // Add version info for future compatibility
    };
    
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadFilename = filename || currentFilePath || 'drakon_project.json';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update the current file path if it wasn't already set
    if (!currentFilePath || filename) {
      setCurrentFilePath(downloadFilename);
    }
    
    setHasUnsavedChanges(false);
    return downloadFilename;
  };

  // Track changes in the graph
  const markUnsavedChanges = () => {
    setHasUnsavedChanges(true);
  };

  return {
    currentFilePath,
    hasUnsavedChanges,
    hasContent,
    createNewProject,
    openProject,
    saveProject,
    markUnsavedChanges,
  };
};

export default useProjectFile; 