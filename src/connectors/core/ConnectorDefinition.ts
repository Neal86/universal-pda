import type { ConnectorKind } from './types';

export type ConnectorDefinition = {
  kind: ConnectorKind;
  label: string;
  description: string;
  protocolVersion: 1;
};
