import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateSelectionDialog from '../../components/dialogs/TemplateSelectionDialog';
import { projectTemplates } from '../../utils/projectTemplates';

describe('TemplateSelectionDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTemplate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with all templates when open', () => {
    render(
      <TemplateSelectionDialog
        open={true}
        onClose={mockOnClose}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    // Check that the dialog title is rendered
    expect(screen.getByText('Select a Project Template')).toBeInTheDocument();

    // Check that all templates are rendered
    projectTemplates.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
      expect(screen.getByText(template.description)).toBeInTheDocument();
    });

    // Check that the buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('does not render anything when not open', () => {
    const { container } = render(
      <TemplateSelectionDialog
        open={false}
        onClose={mockOnClose}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    // The dialog should not be visible
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <TemplateSelectionDialog
        open={true}
        onClose={mockOnClose}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectTemplate with the selected template ID when Create Project is clicked', () => {
    render(
      <TemplateSelectionDialog
        open={true}
        onClose={mockOnClose}
        onSelectTemplate={mockOnSelectTemplate}
      />
    );

    // Select a template (Math template)
    fireEvent.click(screen.getByText('Basic Math'));

    // Click the Create Project button
    fireEvent.click(screen.getByText('Create Project'));

    // Verify that onSelectTemplate was called with the correct template ID
    expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
    expect(mockOnSelectTemplate).toHaveBeenCalledWith('math');

    // Verify that onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
}); 