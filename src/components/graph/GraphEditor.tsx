import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
  OnSelectionChangeParams,
  OnMoveEnd,
  Node,
  Edge,
  MiniMap,
  MarkerType,
  Connection,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { styled } from '@mui/material/styles';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CommentIcon from '@mui/icons-material/Comment';

import { useGraphStore } from '../../store/graphStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import NodeWrapper from '../nodes/NodeWrapper';
import NodePalette from '../palette/NodePalette';
import NodeConfiguration from '../configuration/NodeConfiguration';
import { NodeType, NodeData, PortDefinition } from '../../types/node';
import LabeledEdge from '../edges/LabeledEdge';
import ContextMenu, { ContextMenuPosition } from '../menu/ContextMenu';
import CommentNode from '../nodes/CommentNode';
import { EdgeData } from '../../types/graph';

const GraphContainer = styled('div')({
  width: '100%',
  height: '100vh',
  display: 'flex',
});

const FlowContainer = styled('div')({
  flex: 1,
  height: '100%',
  position: 'relative',
});

// Define custom node types
const nodeTypes: NodeTypes = {
  default: NodeWrapper,
  comment: CommentNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  default: LabeledEdge,
};

// Connection validation function
const isValidConnection = (connection: Connection) => {
  // Prevent connecting to the same node
  if (connection.source === connection.target) {
    return false;
  }
  
  // Prevent duplicate connections
  const { edges } = useGraphStore.getState();
  const isDuplicate = edges.some(
    edge => 
      edge.source === connection.source && 
      edge.sourceHandle === connection.sourceHandle &&
      edge.target === connection.target &&
      edge.targetHandle === connection.targetHandle
  );
  
  if (isDuplicate) {
    return false;
  }
  
  return true;
};

const GraphControls = () => {
  const { undo, redo, copySelectedElements, pasteElements } = useGraphStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Add a comment at the center of the viewport
  const addComment = () => {
    const { viewport } = useGraphStore.getState();
    const id = `comment_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate center position
    const position = {
      x: (-viewport.x + window.innerWidth / 2) / viewport.zoom - 75, // Center x, adjusting for node width
      y: (-viewport.y + window.innerHeight / 2) / viewport.zoom - 30, // Center y, adjusting for node height
    };
    
    // Create comment node with proper NodeData structure
    const commentNode = {
      id,
      type: 'comment',
      position,
      data: {
        label: 'Comment',
        type: 'comment',
        inputs: [],
        outputs: [],
        config: { text: 'Add note here...' }
      },
      selected: true,
    };
    
    useGraphStore.getState().addNode(commentNode);
  };

  return (
    <Panel position="top-left">
      <ButtonGroup>
        <Tooltip title="Undo (Ctrl+Z)">
          <Button onClick={undo} size="small">
            <UndoIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <Button onClick={redo} size="small">
            <RedoIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Zoom In">
          <Button onClick={() => zoomIn()} size="small">
            <ZoomInIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button onClick={() => zoomOut()} size="small">
            <ZoomOutIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Fit View">
          <Button onClick={() => fitView()} size="small">
            <FitScreenIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Copy (Ctrl+C)">
          <Button onClick={copySelectedElements} size="small">
            <FileCopyIcon fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Paste (Ctrl+V)">
          <Button onClick={pasteElements} size="small">
            <ContentPasteIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: 8 }}>
        <Tooltip title="Add Comment (Ctrl+M)">
          <Button onClick={addComment} size="small">
            <CommentIcon fontSize="small" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Panel>
  );
};

// Generate a unique node ID
const getId = (): string => `node_${Math.random().toString(36).substr(2, 9)}`;

interface DragItem {
  type: string;
  nodeType: NodeType;
}

const GraphEditorInner = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedElements,
    setViewport,
    selectedElements,
    clipboard
  } = useGraphStore();
  const { screenToFlowPosition } = useReactFlow();
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    position: ContextMenuPosition;
  }>({
    open: false,
    position: { x: 0, y: 0 },
  });
  
  // Detect if there's content in the clipboard
  const hasClipboardContent = clipboard != null && 
    ((clipboard.nodes != null && clipboard.nodes.length > 0) || 
     (clipboard.edges != null && clipboard.edges.length > 0));

  // Use keyboard shortcuts
  useKeyboardShortcuts();

  // Update selected elements when selection changes
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      setSelectedElements({
        nodes: selectedNodes.map((node: Node<NodeData>) => node.id),
        edges: selectedEdges.map((edge: Edge<EdgeData>) => edge.id),
      });
    },
    [setSelectedElements]
  );

  // Handle viewport changes
  const onMoveEnd: OnMoveEnd = useCallback(
    (_, viewport) => {
      setViewport(viewport);
    },
    [setViewport]
  );

  // Handle drop event from palette
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Get drop position adjusted to current viewport
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Get the dragged node type data
      const jsonData = event.dataTransfer.getData('application/drakon-node');
      
      if (jsonData) {
        try {
          const dragItem = JSON.parse(jsonData) as DragItem;
          const nodeType = dragItem.nodeType;

          // Create a new node
          const newNode: Node<NodeData> = {
            id: getId(),
            type: 'default',
            position,
            data: {
              label: nodeType.label,
              type: nodeType.id,
              inputs: nodeType.inputs,
              outputs: nodeType.outputs,
              config: { ...nodeType.defaultConfig },
            },
          };

          // Add node to the graph
          addNode(newNode);
        } catch (error) {
          console.error('Error adding node:', error);
        }
      }
    },
    [addNode, screenToFlowPosition]
  );

  // Enable drop by preventing default behavior for drag over events
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle connection creation with custom edge properties
  const handleConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        console.error('Invalid connection parameters:', params);
        return;
      }
      
      // Get source node and port details
      const sourceNode = nodes.find((n: Node<NodeData>) => n.id === params.source);
      const sourcePort = sourceNode?.data.outputs?.find((p: PortDefinition) => p.id === params.sourceHandle);
      
      // Get target node and port details
      const targetNode = nodes.find((n: Node<NodeData>) => n.id === params.target);
      const targetPort = targetNode?.data.inputs?.find((p: PortDefinition) => p.id === params.targetHandle);
      
      if (!sourceNode || !targetNode) {
        console.error('Could not find source or target node for connection:', params);
        return;
      }
      
      // Create label from port names
      const sourceName = sourcePort?.label || 'output';
      const targetName = targetPort?.label || 'input';
      const sourceType = sourcePort?.type || 'unknown';
      
      // Enhance the connection with custom data and style
      const enhancedConnection = {
        ...params,
        id: `e${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
        type: 'default', // Use our custom edge type
        animated: false, // Set to true for animated edges if needed
        markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
        data: {
          label: `${sourceName} → ${targetName}`,
          sourceType: sourceType,
          targetType: targetPort?.type,
        },
      };
      
      console.log('Creating connection:', enhancedConnection);
      onConnect(enhancedConnection);
    },
    [nodes, onConnect]
  );

  // Handle context menu open
  const onContextMenu = (event: React.MouseEvent) => {
    // Prevent default context menu
    event.preventDefault();
    
    // Get mouse position
    setContextMenu({
      open: true,
      position: { x: event.clientX, y: event.clientY },
    });
  };
  
  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, open: false });
  };
  
  // Handle delete action from context menu
  const handleDelete = () => {
    const { selectedElements } = useGraphStore.getState();
    
    // Delete selected nodes
    if (selectedElements.nodes.length > 0) {
      const nodeChanges = selectedElements.nodes.map((id: string) => ({
        id,
        type: 'remove' as const,
      }));
      onNodesChange(nodeChanges);
    }
    
    // Delete selected edges
    if (selectedElements.edges.length > 0) {
      const edgeChanges = selectedElements.edges.map((id: string) => ({
        id,
        type: 'remove' as const,
      }));
      onEdgesChange(edgeChanges);
    }
  };

  // Add a reference to the copy and paste handlers
  const handleCopy = useCallback(() => {
    useGraphStore().copySelectedElements();
  }, []);

  const handlePaste = useCallback(() => {
    useGraphStore().pasteElements();
  }, []);

  return (
    <GraphContainer 
      data-testid="graph-container"
      onContextMenu={onContextMenu}
    >
      <NodePalette />
      <FlowContainer>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={onSelectionChange}
          onMoveEnd={onMoveEnd}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'default',
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          connectionLineStyle={{ stroke: '#555' }}
          connectionLineType={ConnectionLineType.Bezier}
          isValidConnection={isValidConnection}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Control', 'Meta']}
          selectionKeyCode={['Shift']}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background />
          <Controls />
          <GraphControls />
          <MiniMap 
            nodeStrokeColor={(n) => {
              return n.selected ? '#ff0072' : '#555';
            }}
            nodeColor={(n) => {
              return n.data.type.startsWith('math.') 
                ? '#00ff00' 
                : n.data.type.startsWith('io.') 
                ? '#0041d0' 
                : '#ff0072';
            }}
            style={{ height: 120 }}
          />
        </ReactFlow>
        
        {/* Context Menu */}
        <ContextMenu
          open={contextMenu.open}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDelete={handleDelete}
          hasSelection={selectedElements.nodes.length > 0 || selectedElements.edges.length > 0}
          hasClipboard={hasClipboardContent}
        />
      </FlowContainer>
      <NodeConfiguration />
    </GraphContainer>
  );
};

// Wrap with ReactFlowProvider to access ReactFlow context
const GraphEditor = () => {
  return (
    <ReactFlowProvider>
      <GraphEditorInner />
    </ReactFlowProvider>
  );
};

export default GraphEditor; 