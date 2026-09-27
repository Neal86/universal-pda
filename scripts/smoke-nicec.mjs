#!/usr/bin/env node

const baseUrl = String(process.env.PDA_BASE_URL || '').replace(/\/+$/, '');
const username = String(process.env.PDA_USERNAME || '').trim();
const password = String(process.env.PDA_PASSWORD || '');
const warehouseId = Number(process.env.PDA_WAREHOUSE_ID || 0);
const identifyBarcode = String(process.env.PDA_BARCODE || '').trim();

if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
  throw new Error('PDA_BASE_URL must be an absolute HTTP(S) URL.');
}
if (!username || !password) {
  throw new Error('PDA_USERNAME and PDA_PASSWORD are required.');
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-WMS-Client': 'mobile',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.idempotencyKey
        ? { 'Idempotency-Key': options.idempotencyKey }
        : {}),
      ...(options.headers || {}),
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `HTTP ${response.status}`;
    throw new Error(`${options.method || 'GET'} ${path}: ${message}`);
  }
  return payload;
}

function pass(name, detail = '') {
  console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
}

const login = await jsonRequest('/mobile/v1/auth/login', {
  method: 'POST',
  body: { username, password },
});
if (!login?.token) throw new Error('Login response did not contain a token.');
pass('auth/login', login.user?.role || 'authenticated');

let token = login.token;
let activeWarehouseId = Number(login.user?.activeWarehouseId || 0);

const warehouses = await jsonRequest('/mobile/v1/warehouses', { token });
if (!Array.isArray(warehouses?.items)) {
  throw new Error('Warehouses response is invalid.');
}
pass('warehouses', `${warehouses.items.length} available`);

if (!activeWarehouseId) {
  const selected =
    warehouseId ||
    (warehouses.items.length === 1 ? Number(warehouses.items[0]?.id || 0) : 0);
  if (!selected) {
    throw new Error(
      'No active warehouse. Set PDA_WAREHOUSE_ID to one of the returned warehouse IDs.',
    );
  }

  const switched = await jsonRequest('/mobile/v1/warehouse-context', {
    method: 'POST',
    token,
    body: { warehouseId: selected },
  });
  if (!switched?.token || !switched?.activeWarehouseId) {
    throw new Error('Warehouse-context response is invalid.');
  }
  token = switched.token;
  activeWarehouseId = Number(switched.activeWarehouseId);
  pass('warehouse-context', String(activeWarehouseId));
}

const capabilities = await jsonRequest('/mobile/v1/capabilities', { token });
if (!Array.isArray(capabilities?.features)) {
  throw new Error('Capabilities response is invalid.');
}
pass('capabilities', `${capabilities.features.length} features`);

const dashboard = await jsonRequest('/mobile/v1/dashboard', { token });
if (!Array.isArray(dashboard?.metrics)) {
  throw new Error('Dashboard response is invalid.');
}
pass('dashboard', `${dashboard.metrics.length} metrics`);

const tasks = await jsonRequest('/mobile/v1/tasks?status=open', { token });
if (!Array.isArray(tasks)) {
  throw new Error('Tasks response is invalid.');
}
pass('tasks', `${tasks.length} open`);

if (identifyBarcode) {
  const operationId = `smoke_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const result = await jsonRequest('/mobile/v1/scan', {
    method: 'POST',
    token,
    idempotencyKey: operationId,
    body: {
      operationId,
      barcode: identifyBarcode,
      source: 'manual',
      workflow: 'identify',
      scannedAt: new Date().toISOString(),
    },
  });
  pass('identify', result?.kind || 'result returned');
}

console.log(
  `NiceC read-only smoke test complete. Active warehouse: ${activeWarehouseId}.`,
);
