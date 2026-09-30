import type { WorkflowDefinition } from '@/workflows/core/types';

export const identifyWorkflow: WorkflowDefinition = {
  id: 'identify',
  label: 'Identify',
  description: 'Identify a product, location, order, tote, shipment, or other barcode.',
  requiredCapability: 'scan',
};
