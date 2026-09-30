import type { WorkflowDefinition } from '@/workflows/core/types';

export const packWorkflow: WorkflowDefinition = {
  id: 'pack',
  label: 'Pack',
  description: 'Verify and pack picked inventory.',
  requiredCapability: 'pack',
};
