import type { ConnectorDefinition } from '@/connectors/core/ConnectorDefinition';

export const sapConnector: ConnectorDefinition = {
  kind: 'sap',
  label: 'SAP',
  description: 'SAP operations through a server-side Universal PDA adapter.',
  protocolVersion: 1,
  authMode: 'token',
};
