export type WorkflowKind =
  | 'identify'
  | 'receive'
  | 'putaway'
  | 'pick'
  | 'pack'
  | 'ship'
  | 'count'
  | 'move'
  | 'return';

export type WorkflowDefinition = {
  id: WorkflowKind;
  label: string;
  description: string;
  requiredCapability: string;
};
