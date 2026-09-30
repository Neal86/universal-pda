import type { ConnectorAuthMode, ConnectorKind } from './types';

export type ConnectorDefinition = {
  kind: ConnectorKind;
  label: string;
  description: string;
  protocolVersion: 1;
  authMode: ConnectorAuthMode;
};
