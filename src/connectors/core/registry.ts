import type { ConnectorDefinition } from './ConnectorDefinition';
import type { ConnectorKind } from './types';
import { customRestConnector } from '@/connectors/custom-rest/definition';
import { nicecConnector } from '@/connectors/nicec/definition';
import { odooConnector } from '@/connectors/odoo/definition';
import { sapConnector } from '@/connectors/sap/definition';

const universalConnector: ConnectorDefinition = {
  kind: 'universal',
  label: 'Universal Gateway',
  description: 'Vendor-neutral Universal PDA Connector Protocol v1 endpoint.',
  protocolVersion: 1,
};

export const connectorDefinitions: readonly ConnectorDefinition[] = [
  universalConnector,
  nicecConnector,
  odooConnector,
  sapConnector,
  customRestConnector,
];

export function getConnectorDefinition(kind: ConnectorKind): ConnectorDefinition {
  const definition = connectorDefinitions.find((item) => item.kind === kind);
  if (!definition) {
    throw new Error(`Unsupported connector kind: ${kind}`);
  }
  return definition;
}
