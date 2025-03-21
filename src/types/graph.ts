import { Edge, Viewport } from 'reactflow';
import { CustomNode } from './node';

export interface GraphState {
  nodes: CustomNode[];
  edges: Edge[];
  viewport: Viewport;
  selectedElements: { nodes: string[]; edges: string[] };
  history: {
    past: { nodes: CustomNode[]; edges: Edge[] }[];
    future: { nodes: CustomNode[]; edges: Edge[] }[];
  };
} 