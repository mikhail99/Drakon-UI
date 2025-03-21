import { renderHook, act } from '@testing-library/react-hooks';
import { useTemplateStore } from '../../store/templateStore';
import { getTemplateById, projectTemplates } from '../../utils/projectTemplates';

describe('templateStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useTemplateStore());
    act(() => {
      // Reset to default template
      result.current.setActiveTemplate('all');
    });
  });

  it('should initialize with the "all" template by default', () => {
    const { result } = renderHook(() => useTemplateStore());
    expect(result.current.activeTemplateId).toBe('all');
    expect(result.current.activeTemplate).toEqual(getTemplateById('all'));
  });

  it('should update the active template when setActiveTemplate is called', () => {
    const { result } = renderHook(() => useTemplateStore());
    
    act(() => {
      result.current.setActiveTemplate('math');
    });
    
    expect(result.current.activeTemplateId).toBe('math');
    expect(result.current.activeTemplate).toEqual(getTemplateById('math'));
  });

  it('should handle invalid template IDs and set activeTemplate to null', () => {
    const { result } = renderHook(() => useTemplateStore());
    
    act(() => {
      result.current.setActiveTemplate('non-existent-template');
    });
    
    expect(result.current.activeTemplateId).toBe('non-existent-template');
    expect(result.current.activeTemplate).toBeNull();
  });
}); 