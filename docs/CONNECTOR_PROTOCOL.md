# Universal PDA Connector Protocol v1

Universal PDA connects to an HTTPS gateway that normalizes an ERP/WMS into a stable mobile contract.

All authenticated requests use:

`Authorization: Bearer <scoped-mobile-token>`

Mobile requests send:

`X-WMS-Client: mobile`

The gateway must never return ERP administrator credentials to the device.

## Authentication

Token-only connectors may provision a scoped token outside the app.

Credential-exchange connectors can implement:

`POST /mobile/v1/auth/login`

```json
{
  "username": "operator@example.com",
  "password": "temporary-form-value"
}
```

Response:

```json
{
  "protocolVersion": 1,
  "token": "scoped-mobile-jwt",
  "user": {
    "id": 42,
    "name": "Warehouse Operator",
    "role": "WAREHOUSE_OPERATOR",
    "activeWarehouseId": 3
  },
  "warehouses": [
    { "id": 3, "name": "Los Angeles", "code": "LA" }
  ]
}
```

The client must discard the password immediately after token exchange and must never persist it.

## Warehouse context

`GET /mobile/v1/warehouses`

`POST /mobile/v1/warehouse-context`

```json
{
  "warehouseId": 3
}
```

The server validates warehouse scope and returns a refreshed token containing the selected warehouse context.

## Capabilities

`GET /mobile/v1/capabilities`

```json
{
  "protocolVersion": 1,
  "systemName": "Example WMS",
  "organizationName": "Example Inc",
  "warehouseName": "Los Angeles",
  "features": [
    "dashboard",
    "tasks",
    "inventory",
    "scan",
    "identify",
    "receive",
    "putaway",
    "pick",
    "pack",
    "ship",
    "count",
    "move",
    "return",
    "notifications",
    "warehouse-switching"
  ]
}
```

The app hides unsupported navigation and workflows based on this response.

## Dashboard

`GET /mobile/v1/dashboard`

```json
{
  "title": "Los Angeles Warehouse",
  "subtitle": "Live operations",
  "updatedAt": "2026-09-23T19:00:00Z",
  "metrics": [
    { "id": "to_receive", "label": "To Receive", "value": 18 },
    { "id": "open_tasks", "label": "Open Tasks", "value": 32 },
    { "id": "exceptions", "label": "Exceptions", "value": 4 }
  ]
}
```

Production payloads must come from real business data, not mock fixtures.

## Tasks

`GET /mobile/v1/tasks?status=open`

`POST /mobile/v1/tasks/:id/complete`

`POST /mobile/v1/tasks/:id/exception`

```json
{
  "exceptionType": "other",
  "severity": "high",
  "description": "Bin is blocked by damaged pallet",
  "affectsPerformance": true
}
```

`POST /mobile/v1/tasks/:id/exception/resolve`

Task mutations must enforce assignment, role, warehouse scope, state transitions, and audit logging server-side.

## Inventory

`GET /mobile/v1/inventory/search?q=<query>`

The response is a normalized list of inventory records:

```json
[
  {
    "id": "9001",
    "sku": "NC-CHAIR-001",
    "name": "Camping Chair",
    "barcode": "0123456789012",
    "quantity": 128,
    "available": 120,
    "uom": "Units",
    "warehouse": "3",
    "location": "LA/A01/03",
    "locationId": 58,
    "lot": "LOT-2026-09"
  }
]
```

## Workflow scan

`POST /mobile/v1/scan`

Every scan mutation includes a durable operation ID:

```json
{
  "operationId": "scan_m...",
  "barcode": "0123456789012",
  "source": "keyboard-wedge",
  "workflow": "pick",
  "workflowSessionId": "task:1028",
  "scannedAt": "2026-09-23T19:00:00Z"
}
```

The request should also send the same value in:

`Idempotency-Key: scan_m...`

Example response:

```json
{
  "kind": "pick",
  "title": "Pick SO1028",
  "message": "4 / 4 picked",
  "severity": "success",
  "referenceId": "1028",
  "workflowSessionId": "task:1028",
  "nextPrompt": "Scan destination tote",
  "workflowComplete": false
}
```

The server decides the next scan step and must reject wrong products, wrong source bins, wrong destination bins, over-scans, invalid lots/serials, and invalid workflow state.

## Count quantity correction

Scan counting may increment one unit at a time, but the operator can explicitly correct the physical quantity:

`POST /mobile/v1/counts/:id/lines/:lineId`

```json
{
  "countedQty": 0
}
```

Zero is a valid explicit count. The client must not infer zero merely because an item was not scanned.

Manager approval:

`POST /mobile/v1/counts/:id/approve`

## Return details

Read return action:

`GET /mobile/v1/returns/:id`

Classify received quantity:

`POST /mobile/v1/returns/:id/count`

```json
{
  "receivedQty": 10,
  "goodQty": 8,
  "defectiveQty": 2,
  "disposition": "normal_putaway"
}
```

Put away classified return inventory:

`POST /mobile/v1/returns/:id/putaway`

```json
{
  "destinationBarcode": "LA-RETURN-GOOD",
  "defectiveDestinationBarcode": "LA-RETURN-DAMAGED",
  "lotNumber": "LOT-2026-09"
}
```

Manager review completion when applicable:

`POST /mobile/v1/returns/:id/approve`

A return must never silently assume that every received unit is good.

## Push registration

`POST /mobile/v1/devices/push-token`

```json
{
  "token": "ExponentPushToken[...]",
  "platform": "expo"
}
```

Push tokens are device routing identifiers and should be scoped to the authenticated user/warehouse where applicable.

## Offline and retries

The app can persist a failed mutation locally without persisting authorization headers.

When automatic retries are exhausted or an error is non-retriable, the operation becomes **Needs Attention**. The operator can:

- Retry manually using the original operation ID.
- Discard the local queued operation after explicit confirmation.

The server must preserve idempotent behavior for replayed operation IDs.

## Required server controls

- HTTPS in production
- scoped mobile tokens
- token expiry and revocation
- tenant and warehouse isolation
- server-side RBAC
- audit logging
- rate limiting
- idempotency for retried mutations
- schema/input validation
- safe error messages with no secrets
- authoritative workflow state validation
- authoritative inventory/location validation
