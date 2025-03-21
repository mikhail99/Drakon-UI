import React from 'react';
import { NodeType, PortType } from '../../types/node';
import NodeWrapper from '../nodes/NodeWrapper';

// "any" is not in PortType, so we'll use a union of existing types
const anyType: PortType = 'object'; // Using object as a generic type

// Example node type definitions for the node palette
export const testNodeTypes: NodeType[] = [
  {
    id: 'io.input',
    label: 'Input',
    description: 'Input value',
    category: 'I/O',
    inputs: [],
    outputs: [
      {
        id: 'output',
        label: 'Value',
        type: 'number',
        description: 'The input value',
      },
    ],
    defaultConfig: {
      value: 0,
    },
    component: NodeWrapper,
  },
  {
    id: 'math.add',
    label: 'Add',
    description: 'Add two numbers',
    category: 'Math',
    inputs: [
      {
        id: 'a',
        label: 'A',
        type: 'number',
        description: 'First input',
      },
      {
        id: 'b',
        label: 'B',
        type: 'number',
        description: 'Second input',
      },
    ],
    outputs: [
      {
        id: 'sum',
        label: 'Sum',
        type: 'number',
        description: 'A + B',
      },
    ],
    defaultConfig: {},
    component: NodeWrapper,
  },
  {
    id: 'math.subtract',
    label: 'Subtract',
    description: 'Subtract two numbers',
    category: 'Math',
    inputs: [
      {
        id: 'a',
        label: 'A',
        type: 'number',
        description: 'First input',
      },
      {
        id: 'b',
        label: 'B',
        type: 'number',
        description: 'Second input',
      },
    ],
    outputs: [
      {
        id: 'difference',
        label: 'Difference',
        type: 'number',
        description: 'A - B',
      },
    ],
    defaultConfig: {},
    component: NodeWrapper,
  },
  {
    id: 'logic.if',
    label: 'If-Else',
    description: 'Conditional branch',
    category: 'Logic',
    inputs: [
      {
        id: 'condition',
        label: 'Condition',
        type: 'boolean',
        description: 'Boolean condition',
      },
      {
        id: 'then',
        label: 'Then',
        type: anyType,
        description: 'Value if condition is true',
      },
      {
        id: 'else',
        label: 'Else',
        type: anyType,
        description: 'Value if condition is false',
      },
    ],
    outputs: [
      {
        id: 'result',
        label: 'Result',
        type: anyType,
        description: 'Result based on condition',
      },
    ],
    defaultConfig: {},
    component: NodeWrapper,
  },
]; 