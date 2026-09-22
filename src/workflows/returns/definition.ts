import type { WorkflowDefinition } from '@/workflows/core/types';

export const returnWorkflow: WorkflowDefinition = {
  id: 'return',
  label: 'Return',
  description: 'Receive and classify returned inventory.',
  requiredCapability: 'return',
};
