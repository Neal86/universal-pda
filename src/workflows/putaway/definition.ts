import type { WorkflowDefinition } from '@/workflows/core/types';

export const putawayWorkflow: WorkflowDefinition = {
  id: 'putaway',
  label: 'Putaway',
  description: 'Move received inventory into its storage location.',
  requiredCapability: 'putaway',
};
