import type { ConnectorDefinition } from '@/connectors/core/ConnectorDefinition';

export const odooConnector: ConnectorDefinition = {
  kind: 'odoo',
  label: 'Odoo',
  description: 'Odoo operations through a server-side Universal PDA adapter.',
  protocolVersion: 1,
};
