import type { WorkflowDefinition } from '@/workflows/core/types';

export const moveWorkflow: WorkflowDefinition = {
  id: 'move',
  label: 'Move',
  description: 'Move inventory between warehouse locations.',
  requiredCapability: 'move',
};
