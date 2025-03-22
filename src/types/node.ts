import { ReactNode } from 'react';
import { Node, NodeProps as ReactFlowNodeProps } from 'reactflow';

export type PortType = 'number' | 'string' | 'boolean' | 'array' | 'object';

export interface PortDefinition {
  id: string;
  label: string;
  type: PortType;
  required?: boolean;
  description?: string;
}

export interface NodeType {
  id: string;
  label: string;
  category: string;
  description?: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  defaultConfig: Record<string, any>;
  component: React.ComponentType<NodeProps>;
}

export interface NodeData {
  label: string;
  type: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  config: Record<string, any>;
  hasError?: boolean;
  errorMessage?: string;
  description?: string;
}

export interface NodeProps extends Omit<ReactFlowNodeProps, 'data'> {
  data: NodeData;
}

export type CustomNode = Node<NodeData>;

/**
 * NodeFolder represents a folder for organizing nodes in the NodeTreeView
 */
export interface NodeFolder {
  id: string;
  name: string;
  parentId?: string | null;
  // Nodes contained in this folder (reference to node IDs)
  nodeIds: string[];
}

/**
 * NodeOrganization handles the overall folder structure for nodes
 */
export interface NodeOrganization {
  folders: Record<string, NodeFolder>;
  // Node ID to folder ID mapping
  nodeToFolder: Record<string, string>;
} 