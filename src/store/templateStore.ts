import { create } from 'zustand';
import { ProjectTemplate, getTemplateById, projectTemplates } from '../utils/projectTemplates';

interface TemplateState {
  activeTemplateId: string;
  activeTemplate: ProjectTemplate | null;
}

interface TemplateStore extends TemplateState {
  setActiveTemplate: (templateId: string) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  // Default to 'all' template
  activeTemplateId: 'all',
  activeTemplate: getTemplateById('all') || null,

  // Set the active template
  setActiveTemplate: (templateId: string) => {
    const template = getTemplateById(templateId);
    set({
      activeTemplateId: templateId,
      activeTemplate: template || null,
    });
  },
})); 