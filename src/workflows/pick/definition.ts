import type { WorkflowDefinition } from '@/workflows/core/types';

export const pickWorkflow: WorkflowDefinition = {
  id: 'pick',
  label: 'Pick',
  description: 'Pick outbound inventory into totes or orders.',
  requiredCapability: 'pick',
};
