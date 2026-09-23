import type { ScannerSource } from '@/device/scanner/core/types';
import type { WorkflowKind } from '@/workflows/core/types';

export type ConnectorKind = 'universal' | 'nicec' | 'odoo' | 'sap' | 'custom-rest';
export type ConnectorAuthMode = 'token' | 'credentials';

export type ConnectionRecord = {
  id: string;
  name: string;
  connectorKind: ConnectorKind;
  baseUrl: string;
  activeWarehouseId?: number;
  createdAt: string;
  updatedAt: string;
};

export type CapabilitySet = {
  protocolVersion?: number;
  systemName?: string;
  organizationName?: string;
  warehouseName?: string;
  features: string[];
};

export type WarehouseOption = {
  id: number;
  name: string;
  code?: string;
  companyId?: number;
  active?: boolean;
};

export type WarehouseListPayload = {
  items: WarehouseOption[];
  activeWarehouseId?: number | null;
};

export type MobileUser = {
  id: number;
  username?: string;
  name: string;
  role: string;
  warehouseIds?: number[];
  activeWarehouseId?: number | null;
  permissions?: string[];
};

export type CredentialLoginPayload = {
  protocolVersion?: number;
  token: string;
  user: MobileUser;
  warehouses: WarehouseOption[];
};

export type WarehouseSwitchPayload = {
  token: string;
  user: MobileUser;
  activeWarehouseId: number;
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
  plannedQty?: number;
  completedQty?: number;
  progressPercent?: number;
  assigneeId?: number;
  pickingId?: number;
  dueAt?: string;
  reviewRequired?: boolean;
  scanRequired?: boolean;
  exceptionReason?: string;
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
  locationId?: number;
  lot?: string;
  package?: string;
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

export type ReturnActionDetails = {
  id: string;
  name: string;
  actionType: string;
  state: string;
  inboundState?: string;
  sku?: string;
  fnsku?: string;
  quantity: number;
  receivedQty: number;
  goodQty: number;
  defectiveQty: number;
  productId?: number;
  productName?: string;
  destinationLocationId?: number;
  defectiveDestinationLocationId?: number;
  lotNumber?: string;
};

export type CountLineUpdateResult = {
  countId: number;
  lineId: number;
  countedQty: number;
  systemQty: number;
  differenceQty: number;
  enteredLines: number;
  totalLines: number;
  state: string;
  submittedForReview: boolean;
};
