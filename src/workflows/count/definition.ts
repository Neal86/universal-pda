import type { WorkflowDefinition } from '@/workflows/core/types';

export const countWorkflow: WorkflowDefinition = {
  id: 'count',
  label: 'Count',
  description: 'Perform cycle count and inventory verification.',
  requiredCapability: 'count',
};
