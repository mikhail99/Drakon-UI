import { 
  projectTemplates, 
  getTemplateById, 
  getNodeTypesForTemplate 
} from '../../utils/projectTemplates';
import { nodeTypes as allNodeTypes } from '../../utils/nodeTypes';

describe('projectTemplates', () => {
  describe('getTemplateById', () => {
    it('should return the correct template when given a valid ID', () => {
      const mathTemplate = getTemplateById('math');
      expect(mathTemplate).toBeDefined();
      expect(mathTemplate?.id).toBe('math');
      expect(mathTemplate?.name).toBe('Basic Math');
    });

    it('should return undefined when given an invalid ID', () => {
      const invalidTemplate = getTemplateById('non-existent-template');
      expect(invalidTemplate).toBeUndefined();
    });
  });

  describe('getNodeTypesForTemplate', () => {
    it('should return filtered node types for a specific template', () => {
      const mathNodeTypes = getNodeTypesForTemplate('math');
      
      // Verify that we get only the node types specified in the math template
      const mathTemplate = getTemplateById('math');
      const expectedNodeTypeIds = mathTemplate?.nodeTypes || [];
      
      // Check that we have the right number of node types
      expect(Object.keys(mathNodeTypes).length).toBe(expectedNodeTypeIds.length);
      
      // Check that each node type in the result is expected
      Object.keys(mathNodeTypes).forEach(nodeTypeId => {
        expect(expectedNodeTypeIds).toContain(nodeTypeId);
      });
    });

    it('should return all node types for the "all" template', () => {
      const allTemplateNodeTypes = getNodeTypesForTemplate('all');
      expect(Object.keys(allTemplateNodeTypes).length).toBe(Object.keys(allNodeTypes).length);
    });

    it('should return all node types when given an invalid template ID', () => {
      const invalidTemplateNodeTypes = getNodeTypesForTemplate('non-existent-template');
      expect(Object.keys(invalidTemplateNodeTypes).length).toBe(Object.keys(allNodeTypes).length);
    });
  });
}); 