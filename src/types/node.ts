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
}

export interface NodeProps extends Omit<ReactFlowNodeProps, 'data'> {
  data: NodeData;
}

export type CustomNode = Node<NodeData>; 