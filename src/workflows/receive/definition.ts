import type { WorkflowDefinition } from '@/workflows/core/types';

export const receiveWorkflow: WorkflowDefinition = {
  id: 'receive',
  label: 'Receive',
  description: 'Receive inbound inventory against the connected system.',
  requiredCapability: 'receive',
};
