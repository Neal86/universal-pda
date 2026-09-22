import type { WorkflowDefinition, WorkflowKind } from './types';
import { countWorkflow } from '@/workflows/count/definition';
import { identifyWorkflow } from '@/workflows/identify/definition';
import { moveWorkflow } from '@/workflows/move/definition';
import { packWorkflow } from '@/workflows/pack/definition';
import { pickWorkflow } from '@/workflows/pick/definition';
import { putawayWorkflow } from '@/workflows/putaway/definition';
import { receiveWorkflow } from '@/workflows/receive/definition';
import { returnWorkflow } from '@/workflows/returns/definition';
import { shipWorkflow } from '@/workflows/ship/definition';

export const workflowDefinitions: readonly WorkflowDefinition[] = [
  identifyWorkflow,
  receiveWorkflow,
  putawayWorkflow,
  pickWorkflow,
  packWorkflow,
  shipWorkflow,
  countWorkflow,
  moveWorkflow,
  returnWorkflow,
];

export function getWorkflowDefinition(id: WorkflowKind): WorkflowDefinition {
  const workflow = workflowDefinitions.find((item) => item.id === id);
  if (!workflow) {
    throw new Error(`Unsupported workflow: ${id}`);
  }
  return workflow;
}
