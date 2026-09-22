import type { ConnectorDefinition } from '@/connectors/core/ConnectorDefinition';

export const nicecConnector: ConnectorDefinition = {
  kind: 'nicec',
  label: 'NiceC WMS',
  description: 'NiceC warehouse operations through the Universal PDA mobile protocol.',
  protocolVersion: 1,
};
