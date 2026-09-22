import type { ConnectorDefinition } from '@/connectors/core/ConnectorDefinition';

export const customRestConnector: ConnectorDefinition = {
  kind: 'custom-rest',
  label: 'Custom Gateway',
  description: 'Any backend implementing Universal PDA Connector Protocol v1.',
  protocolVersion: 1,
};
