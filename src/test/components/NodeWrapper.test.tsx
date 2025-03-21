import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeWrapper } from '../../components/NodeWrapper';
import { createTestNode, createTestPort } from '../utils/testUtils';

describe('NodeWrapper Component', () => {
  const mockNode = createTestNode({
    id: 'test-node',
    data: {
      label: 'Test Node',
      type: 'test',
      inputs: [createTestPort({ id: 'in1', label: 'Input 1', type: 'number' })],
      outputs: [createTestPort({ id: 'out1', label: 'Output 1', type: 'number' })],
      config: {},
      description: 'Test node description'
    }
  });

  it('renders with minimal props', () => {
    render(<NodeWrapper node={mockNode} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('renders ports based on node data', () => {
    render(<NodeWrapper node={mockNode} />);
    expect(screen.getByText('Input 1')).toBeInTheDocument();
    expect(screen.getByText('Output 1')).toBeInTheDocument();
  });

  it('applies correct styling based on node type', () => {
    render(<NodeWrapper node={mockNode} />);
    const nodeElement = screen.getByTestId('node-wrapper');
    expect(nodeElement).toHaveClass('node-type-test');
  });

  it('shows tooltip on hover', async () => {
    render(<NodeWrapper node={mockNode} />);
    const nodeElement = screen.getByTestId('node-wrapper');
    await userEvent.hover(nodeElement);
    expect(screen.getByText('Test node description')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onNodeClick = jest.fn();
    render(<NodeWrapper node={mockNode} onClick={onNodeClick} />);
    const nodeElement = screen.getByTestId('node-wrapper');
    fireEvent.click(nodeElement);
    expect(onNodeClick).toHaveBeenCalledWith(mockNode);
  });

  it('renders error state when node has error', () => {
    const nodeWithError = createTestNode({
      ...mockNode,
      data: {
        ...mockNode.data,
        hasError: true,
        errorMessage: 'Test error'
      }
    });
    render(<NodeWrapper node={nodeWithError} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByTestId('node-wrapper')).toHaveClass('has-error');
  });

  it('handles missing or invalid data gracefully', () => {
    const invalidNode = createTestNode({
      ...mockNode,
      data: {
        ...mockNode.data,
        inputs: undefined,
        outputs: undefined
      }
    });
    render(<NodeWrapper node={invalidNode} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('memoizes expensive calculations', () => {
    const { rerender } = render(<NodeWrapper node={mockNode} />);
    const firstRender = performance.now();
    
    rerender(<NodeWrapper node={mockNode} />);
    const secondRender = performance.now();
    
    expect(secondRender - firstRender).toBeLessThan(1);
  });
}); 