import { NodeType } from '../types/node';

// Sample node types for the palette
export const nodeTypes: Record<string, NodeType> = {
  // Math operations
  'math.add': {
    id: 'math.add',
    label: 'Add',
    category: 'Math',
    description: 'Adds two numbers together',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true },
    ],
    outputs: [{ id: 'sum', label: 'Sum', type: 'number' }],
    defaultConfig: {},
    component: () => null, // Will be replaced by NodeWrapper
  },
  'math.subtract': {
    id: 'math.subtract',
    label: 'Subtract',
    category: 'Math',
    description: 'Subtracts one number from another',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true },
    ],
    outputs: [{ id: 'difference', label: 'Difference', type: 'number' }],
    defaultConfig: {},
    component: () => null,
  },
  'math.multiply': {
    id: 'math.multiply',
    label: 'Multiply',
    category: 'Math',
    description: 'Multiplies two numbers',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true },
    ],
    outputs: [{ id: 'product', label: 'Product', type: 'number' }],
    defaultConfig: {},
    component: () => null,
  },
  'math.divide': {
    id: 'math.divide',
    label: 'Divide',
    category: 'Math',
    description: 'Divides one number by another',
    inputs: [
      { id: 'a', label: 'A', type: 'number', required: true },
      { id: 'b', label: 'B', type: 'number', required: true },
    ],
    outputs: [{ id: 'quotient', label: 'Quotient', type: 'number' }],
    defaultConfig: {},
    component: () => null,
  },

  // String operations
  'string.concat': {
    id: 'string.concat',
    label: 'Concatenate',
    category: 'String',
    description: 'Combines two strings',
    inputs: [
      { id: 'a', label: 'A', type: 'string', required: true },
      { id: 'b', label: 'B', type: 'string', required: true },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'string' }],
    defaultConfig: {},
    component: () => null,
  },
  'string.length': {
    id: 'string.length',
    label: 'Length',
    category: 'String',
    description: 'Counts the characters in a string',
    inputs: [{ id: 'text', label: 'Text', type: 'string', required: true }],
    outputs: [{ id: 'length', label: 'Length', type: 'number' }],
    defaultConfig: {},
    component: () => null,
  },

  // Logic operations
  'logic.and': {
    id: 'logic.and',
    label: 'AND',
    category: 'Logic',
    description: 'Performs logical AND operation',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean', required: true },
      { id: 'b', label: 'B', type: 'boolean', required: true },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'boolean' }],
    defaultConfig: {},
    component: () => null,
  },
  'logic.or': {
    id: 'logic.or',
    label: 'OR',
    category: 'Logic',
    description: 'Performs logical OR operation',
    inputs: [
      { id: 'a', label: 'A', type: 'boolean', required: true },
      { id: 'b', label: 'B', type: 'boolean', required: true },
    ],
    outputs: [{ id: 'result', label: 'Result', type: 'boolean' }],
    defaultConfig: {},
    component: () => null,
  },
  'logic.not': {
    id: 'logic.not',
    label: 'NOT',
    category: 'Logic',
    description: 'Performs logical NOT operation',
    inputs: [{ id: 'value', label: 'Value', type: 'boolean', required: true }],
    outputs: [{ id: 'result', label: 'Result', type: 'boolean' }],
    defaultConfig: {},
    component: () => null,
  },

  // Input/Output
  'io.input': {
    id: 'io.input',
    label: 'Input',
    category: 'I/O',
    description: 'User input value',
    inputs: [],
    outputs: [{ id: 'value', label: 'Value', type: 'string' }],
    defaultConfig: {
      label: 'Input',
      defaultValue: '',
    },
    component: () => null,
  },
  'io.output': {
    id: 'io.output',
    label: 'Output',
    category: 'I/O',
    description: 'Display output value',
    inputs: [{ id: 'value', label: 'Value', type: 'string', required: true }],
    outputs: [],
    defaultConfig: {
      label: 'Output',
    },
    component: () => null,
  },

  // Search operations
  'search.byName': {
    id: 'search.byName',
    label: 'Search by Name',
    category: 'Search',
    description: 'Find resources by their name or title',
    inputs: [{ id: 'query', label: 'Query', type: 'string', required: true }],
    outputs: [{ id: 'results', label: 'Results', type: 'array' }],
    defaultConfig: {
      placeholder: 'Enter search terms...'
    },
    component: () => null,
  },
  'search.byId': {
    id: 'search.byId',
    label: 'Search by ID',
    category: 'Search',
    description: 'Find resources by their unique identifier',
    inputs: [{ id: 'id', label: 'ID', type: 'string', required: true }],
    outputs: [{ id: 'result', label: 'Result', type: 'object' }],
    defaultConfig: {},
    component: () => null,
  },
  'search.bySimilarity': {
    id: 'search.bySimilarity',
    label: 'Search by Similarity',
    category: 'Search',
    description: 'Find resources similar to a given text or document',
    inputs: [
      { id: 'content', label: 'Content', type: 'string', required: true },
      { id: 'threshold', label: 'Threshold', type: 'number', required: false }
    ],
    outputs: [{ id: 'results', label: 'Results', type: 'array' }],
    defaultConfig: {
      threshold: 0.75
    },
    component: () => null,
  },

  // Analyze operations
  'analyze.references': {
    id: 'analyze.references',
    label: 'Analyze References',
    category: 'Analyze',
    description: 'Extract and analyze references from a document',
    inputs: [{ id: 'document', label: 'Document', type: 'string', required: true }],
    outputs: [{ id: 'references', label: 'References', type: 'array' }],
    defaultConfig: {},
    component: () => null,
  },
  'analyze.citations': {
    id: 'analyze.citations',
    label: 'Analyze Citations',
    category: 'Analyze',
    description: 'Extract and analyze citations from a document',
    inputs: [{ id: 'document', label: 'Document', type: 'string', required: true }],
    outputs: [{ id: 'citations', label: 'Citations', type: 'array' }],
    defaultConfig: {},
    component: () => null,
  },
  'analyze.topics': {
    id: 'analyze.topics',
    label: 'Analyze Topics',
    category: 'Analyze',
    description: 'Identify and extract key topics from content',
    inputs: [
      { id: 'content', label: 'Content', type: 'string', required: true },
      { id: 'count', label: 'Topic Count', type: 'number', required: false }
    ],
    outputs: [{ id: 'topics', label: 'Topics', type: 'array' }],
    defaultConfig: {
      count: 5
    },
    component: () => null,
  },

  // Think operations
  'think.mindMap': {
    id: 'think.mindMap',
    label: 'Build Mind Map',
    category: 'Think',
    description: 'Generate a mind map from concepts or ideas',
    inputs: [
      { id: 'centralConcept', label: 'Central Concept', type: 'string', required: true },
      { id: 'depth', label: 'Depth', type: 'number', required: false }
    ],
    outputs: [{ id: 'mindMap', label: 'Mind Map', type: 'object' }],
    defaultConfig: {
      depth: 2
    },
    component: () => null,
  },
  'think.brainstorm': {
    id: 'think.brainstorm',
    label: 'Brainstorm',
    category: 'Think',
    description: 'Generate ideas and solutions for a given problem or topic',
    inputs: [
      { id: 'topic', label: 'Topic', type: 'string', required: true },
      { id: 'count', label: 'Idea Count', type: 'number', required: false }
    ],
    outputs: [{ id: 'ideas', label: 'Ideas', type: 'array' }],
    defaultConfig: {
      count: 10
    },
    component: () => null,
  }
};

// Get all unique categories
export const nodeCategories = [...new Set(Object.values(nodeTypes).map(type => type.category))];

// Group node types by category
export const nodeTypesByCategory = nodeCategories.reduce((acc, category) => {
  acc[category] = Object.values(nodeTypes).filter(type => type.category === category);
  return acc;
}, {} as Record<string, NodeType[]>); 