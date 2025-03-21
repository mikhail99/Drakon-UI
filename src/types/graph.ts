import { Node, Edge } from 'reactflow';
import { CustomNode, NodeData, PortType } from './node';

export interface Port {
  id: string;
  label: string;
  type: PortType;
}

export interface EdgeData {
  label?: string;
}

export interface GraphState {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedElements: {
    nodes: string[];
    edges: string[];
  };
  history: {
    past: GraphSnapshot[];
    future: GraphSnapshot[];
  };
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  clipboard: {
    nodes: Node<NodeData>[];
    edges: Edge<EdgeData>[];
  } | null;
}

export interface GraphSnapshot {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  selectedElements: {
    nodes: string[];
    edges: string[];
  };
} 