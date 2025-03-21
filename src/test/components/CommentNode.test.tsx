/** @jsxImportSource react */
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentNode from '../../components/nodes/CommentNode';
import * as graphStoreModule from '../../store/graphStore';

// Mock ReactFlow components 
jest.mock('reactflow', () => ({
  Handle: ({ type, position, id }: { type: string, position: string, id: string }) => (
    <div data-testid={`handle-${type}-${id}`} data-position={position}></div>
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom'
  },
  NodeProps: jest.fn()
}));

// Mock the graph store
jest.mock('../../store/graphStore', () => {
  const updateNodeConfig = jest.fn();
  return {
    __esModule: true,
    default: () => ({
      updateNodeConfig
    }),
    // Add the mock function to the module exports so we can access it in tests
    updateNodeConfigMock: updateNodeConfig
  };
});

// Get access to the mocked function
const updateNodeConfigMock = (graphStoreModule as any).updateNodeConfigMock;

describe('CommentNode Component', () => {
  const mockNode = {
    id: 'comment-1',
    type: 'comment',
    position: { x: 0, y: 0 },
    selected: false,
    zIndex: 1,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    data: {
      label: 'Test Comment',
      text: 'This is a test comment',
      backgroundColor: '#FFFFCC',
      type: 'comment',
      inputs: [],
      outputs: [],
      config: {
        text: 'This is a test comment',
        backgroundColor: '#FFFFCC'
      },
      severity: 'info'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with provided text and background color', () => {
    render(
      <CommentNode 
        id={mockNode.id}
        data={mockNode.data}
        type={mockNode.type}
        selected={mockNode.selected}
        isConnectable={mockNode.isConnectable}
        zIndex={mockNode.zIndex}
        xPos={mockNode.xPos}
        yPos={mockNode.yPos}
        dragHandle=".drag-handle"
        dragging={mockNode.dragging}
      />
    );
    
    expect(screen.getByText('Test Comment')).toBeInTheDocument();
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    
    const commentContainer = screen.getByTestId('comment-node');
    expect(commentContainer).toHaveStyle({ backgroundColor: '#FFFFCC' });
  });

  it('enters edit mode on double click', async () => {
    render(
      <CommentNode 
        id={mockNode.id}
        data={mockNode.data}
        type={mockNode.type}
        selected={mockNode.selected}
        isConnectable={mockNode.isConnectable}
        zIndex={mockNode.zIndex}
        xPos={mockNode.xPos}
        yPos={mockNode.yPos}
        dragHandle=".drag-handle"
        dragging={mockNode.dragging}
      />
    );
    
    const commentContainer = screen.getByTestId('comment-node');
    await userEvent.dblClick(commentContainer);
    
    // Should show a textarea for editing
    const textArea = screen.getByRole('textbox');
    expect(textArea).toBeInTheDocument();
    expect(textArea).toHaveValue('This is a test comment');
  });

  it('updates comment text on save', async () => {
    render(
      <CommentNode 
        id={mockNode.id}
        data={mockNode.data}
        type={mockNode.type}
        selected={mockNode.selected}
        isConnectable={mockNode.isConnectable}
        zIndex={mockNode.zIndex}
        xPos={mockNode.xPos}
        yPos={mockNode.yPos}
        dragHandle=".drag-handle"
        dragging={mockNode.dragging}
      />
    );
    
    // Enter edit mode
    const commentContainer = screen.getByTestId('comment-node');
    await userEvent.dblClick(commentContainer);
    
    // Edit the text
    const textArea = screen.getByRole('textbox');
    await userEvent.clear(textArea);
    await userEvent.type(textArea, 'Updated comment text');
    
    // Save changes
    const saveButton = screen.getByLabelText('Save');
    await userEvent.click(saveButton);
    
    expect(updateNodeConfigMock).toHaveBeenCalledWith(
      'comment-1',
      expect.objectContaining({ text: 'Updated comment text' })
    );
  });

  it('cancels editing without saving', async () => {
    render(
      <CommentNode 
        id={mockNode.id}
        data={mockNode.data}
        type={mockNode.type}
        selected={mockNode.selected}
        isConnectable={mockNode.isConnectable}
        zIndex={mockNode.zIndex}
        xPos={mockNode.xPos}
        yPos={mockNode.yPos}
        dragHandle=".drag-handle"
        dragging={mockNode.dragging}
      />
    );
    
    // Enter edit mode
    const commentContainer = screen.getByTestId('comment-node');
    await userEvent.dblClick(commentContainer);
    
    // Edit the text
    const textArea = screen.getByRole('textbox');
    await userEvent.clear(textArea);
    await userEvent.type(textArea, 'This will be discarded');
    
    // Press Escape to cancel
    fireEvent.keyDown(textArea, { key: 'Escape' });
    
    // Should show original text
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(updateNodeConfigMock).not.toHaveBeenCalled();
  });

  it('saves when pressing Ctrl+Enter', async () => {
    render(
      <CommentNode 
        id={mockNode.id}
        data={mockNode.data}
        type={mockNode.type}
        selected={mockNode.selected}
        isConnectable={mockNode.isConnectable}
        zIndex={mockNode.zIndex}
        xPos={mockNode.xPos}
        yPos={mockNode.yPos}
        dragHandle=".drag-handle"
        dragging={mockNode.dragging}
      />
    );
    
    // Enter edit mode
    const commentContainer = screen.getByTestId('comment-node');
    await userEvent.dblClick(commentContainer);
    
    // Edit the text
    const textArea = screen.getByRole('textbox');
    await userEvent.clear(textArea);
    await userEvent.type(textArea, 'Saved with keyboard');
    
    // Press Ctrl+Enter to save
    fireEvent.keyDown(textArea, { key: 'Enter', ctrlKey: true });
    
    expect(updateNodeConfigMock).toHaveBeenCalledWith(
      'comment-1',
      expect.objectContaining({ text: 'Saved with keyboard' })
    );
  });
}); 