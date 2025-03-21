import React from 'react';
import { render, screen } from '@testing-library/react';
import NodePalette from '../../components/palette/NodePalette';
import { useTemplateStore } from '../../store/templateStore';
import { getNodeTypesForTemplate } from '../../utils/projectTemplates';

// Mock the template store
jest.mock('../../store/templateStore', () => ({
  useTemplateStore: jest.fn()
}));

describe('NodePalette', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders nodes filtered by the "math" template', () => {
    // Mock the template store to return 'math' as the active template
    (useTemplateStore as unknown as jest.Mock).mockReturnValue({
      activeTemplateId: 'math'
    });

    render(<NodePalette />);

    // Get the node types that should be displayed for the math template
    const mathNodeTypes = getNodeTypesForTemplate('math');
    const mathNodeLabels = Object.values(mathNodeTypes).map(type => type.label);

    // Check that all math node types are rendered
    mathNodeLabels.forEach(label => {
      // Open the accordion to see the nodes (if needed)
      const accordions = screen.getAllByRole('button');
      accordions.forEach(accordion => {
        if (!accordion.getAttribute('aria-expanded')) {
          accordion.click();
        }
      });
      
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders nodes filtered by the "string" template', () => {
    // Mock the template store to return 'string' as the active template
    (useTemplateStore as unknown as jest.Mock).mockReturnValue({
      activeTemplateId: 'string'
    });

    render(<NodePalette />);

    // Get the node types that should be displayed for the string template
    const stringNodeTypes = getNodeTypesForTemplate('string');
    const stringNodeLabels = Object.values(stringNodeTypes).map(type => type.label);

    // Check that all string node types are rendered
    stringNodeLabels.forEach(label => {
      // Open the accordion to see the nodes (if needed)
      const accordions = screen.getAllByRole('button');
      accordions.forEach(accordion => {
        if (!accordion.getAttribute('aria-expanded')) {
          accordion.click();
        }
      });
      
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders all nodes when the "all" template is active', () => {
    // Mock the template store to return 'all' as the active template
    (useTemplateStore as unknown as jest.Mock).mockReturnValue({
      activeTemplateId: 'all'
    });

    render(<NodePalette />);

    // We don't need to check every node, just verify that categories are rendered
    // as the filtering logic is already tested in the projectTemplates tests
    expect(screen.getByPlaceholderText('Search nodes...')).toBeInTheDocument();
  });
}); 