import { NodeType } from '../types/node';
import { nodeTypes as allNodeTypes } from './nodeTypes';

/**
 * ProjectTemplate - Defines a template for creating new projects
 * Each template filters the available node types in the palette
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Material-UI icon name
  nodeTypes: string[]; // IDs of node types to include
}

/**
 * Collection of available project templates
 */
export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'math',
    name: 'Basic Math',
    description: 'Template for mathematical operations and calculations',
    icon: 'Calculate',
    nodeTypes: [
      'math.add', 
      'math.subtract', 
      'math.multiply', 
      'math.divide',
      'io.input',
      'io.output'
    ]
  },
  {
    id: 'string',
    name: 'String Processing',
    description: 'Template for text processing and manipulation',
    icon: 'TextFields',
    nodeTypes: [
      'string.concat', 
      'string.length',
      'io.input',
      'io.output'
    ]
  },
  {
    id: 'logic',
    name: 'Logic Operations',
    description: 'Template for boolean logic and conditional processing',
    icon: 'CallSplit',
    nodeTypes: [
      'logic.and', 
      'logic.or', 
      'logic.not',
      'io.input',
      'io.output'
    ]
  },
  {
    id: 'all',
    name: 'Hakken!',
    description: '発見! Your intelligent research assistant with advanced search, analysis, and thinking capabilities',
    icon: 'AutoAwesome',
    nodeTypes: [
      // Search operations
      'search.byName',
      'search.byId',
      'search.bySimilarity',
      // Analyze operations
      'analyze.references',
      'analyze.citations',
      'analyze.topics',
      // Think operations
      'think.mindMap',
      'think.brainstorm',
      // I/O operations (needed for inputs/outputs)
      'io.input',
      'io.output'
    ]
  },
  {
    id: 'sql',
    name: 'SQL Query Builder',
    description: 'Template for building and executing SQL queries',
    icon: 'Storage',
    nodeTypes: [
      // This would normally include SQL-specific nodes
      // But for demonstration, we'll use existing nodes
      'io.input',
      'io.output',
      'string.concat',
      'string.length'
    ]
  }
];

/**
 * Get a template by ID
 */
export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return projectTemplates.find(template => template.id === id);
};

/**
 * Filter node types based on a template
 */
export const getNodeTypesForTemplate = (templateId: string): Record<string, NodeType> => {
  const template = getTemplateById(templateId);
  
  if (!template) {
    // Default to all node types if template not found
    return allNodeTypes;
  }
  
  // Filter node types based on template's nodeTypes list
  return Object.fromEntries(
    Object.entries(allNodeTypes).filter(([id]) => 
      template.nodeTypes.includes(id)
    )
  );
}; 