import type { WorkflowDefinition } from '@/workflows/core/types';

export const shipWorkflow: WorkflowDefinition = {
  id: 'ship',
  label: 'Ship',
  description: 'Confirm shipment handoff and shipment status.',
  requiredCapability: 'ship',
};
