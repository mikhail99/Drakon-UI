import { render, screen, fireEvent } from '@testing-library/react';
import { NodeWrapper } from '../../components/NodeWrapper';
import { ReactFlowProvider } from 'reactflow';
import { createTestNode, createTestPort } from '../utils/testUtils';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ReactFlowProvider>
      {ui}
    </ReactFlowProvider>
  );
};

describe('NodeWrapper Component', () => {
  const mockNode = createTestNode({
    id: 'test-node',
    data: {
      label: 'Test Node',
      type: 'test',
      inputs: [createTestPort({ id: 'in1', label: 'Input 1', type: 'number' })],
      outputs: [createTestPort({ id: 'out1', label: 'Output 1', type: 'number' })],
      config: {}
    }
  });

  it('renders with minimal props', () => {
    renderWithProviders(<NodeWrapper node={mockNode} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('renders ports based on node data', () => {
    renderWithProviders(<NodeWrapper node={mockNode} />);
    expect(screen.getByText('Input 1')).toBeInTheDocument();
    expect(screen.getByText('Output 1')).toBeInTheDocument();
  });

  it('applies correct styling based on node type', () => {
    renderWithProviders(<NodeWrapper node={mockNode} />);
    const nodeElement = screen.getByTestId('node-wrapper');
    expect(nodeElement).toHaveClass('node-type-test');
  });

  it('handles click events', () => {
    const onNodeClick = jest.fn();
    renderWithProviders(<NodeWrapper node={mockNode} onClick={onNodeClick} />);
    const nodeElement = screen.getByTestId('node-wrapper');
    fireEvent.click(nodeElement);
    expect(onNodeClick).toHaveBeenCalledWith(mockNode);
  });

  it('renders error state when node has error', () => {
    const nodeWithError = {
      ...mockNode,
      data: {
        ...mockNode.data,
        hasError: true,
        errorMessage: 'Test error'
      }
    };
    renderWithProviders(<NodeWrapper node={nodeWithError} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByTestId('node-wrapper')).toHaveClass('has-error');
  });

  it('handles missing or invalid data gracefully', () => {
    const invalidNode = createTestNode({
      ...mockNode,
      data: {
        ...mockNode.data,
        inputs: [],
        outputs: []
      }
    });
    renderWithProviders(<NodeWrapper node={invalidNode} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('memoizes expensive calculations', () => {
    const { rerender } = renderWithProviders(<NodeWrapper node={mockNode} />);
    const firstRender = performance.now();
    
    rerender(
      <ReactFlowProvider>
        <NodeWrapper node={mockNode} />
      </ReactFlowProvider>
    );
    const secondRender = performance.now();
    
    // The second render should be significantly faster
    expect(secondRender - firstRender).toBeLessThan(10);
  });
}); 