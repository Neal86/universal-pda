import type { ScannerSource } from '@/device/scanner/core/types';
import type { WorkflowKind } from '@/workflows/core/types';

export type ConnectorKind = 'universal' | 'nicec' | 'odoo' | 'sap' | 'custom-rest';

export type ConnectionRecord = {
  id: string;
  name: string;
  connectorKind: ConnectorKind;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type CapabilitySet = {
  systemName?: string;
  organizationName?: string;
  warehouseName?: string;
  features: string[];
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
};

export type DashboardPayload = {
  title?: string;
  subtitle?: string;
  updatedAt?: string;
  metrics: DashboardMetric[];
};

export type TaskItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  status: string;
  priority?: string;
  updatedAt?: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name?: string;
  barcode?: string;
  quantity?: number;
  available?: number;
  uom?: string;
  warehouse?: string;
  location?: string;
};

export type ScanCommand = {
  operationId: string;
  barcode: string;
  source: ScannerSource;
  symbology?: string;
  workflow: WorkflowKind;
  workflowSessionId?: string;
  scannedAt: string;
};

export type ScanResult = {
  kind?: string;
  title: string;
  message?: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  referenceId?: string;
  workflowSessionId?: string;
  nextPrompt?: string;
  workflowComplete?: boolean;
  data?: Record<string, unknown>;
};
