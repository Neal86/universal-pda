# Universal PDA Connector Protocol v1

Production connections use HTTPS and bearer authentication.

`Authorization: Bearer <scoped-mobile-token>`

The token must be tenant-scoped and least-privilege. The mobile app must not receive ERP administrator credentials.

## Capabilities

`GET /mobile/v1/capabilities`

```json
{
  "systemName": "Example WMS",
  "organizationName": "Example Inc",
  "warehouseName": "Los Angeles",
  "features": [
    "dashboard",
    "tasks",
    "inventory",
    "scan",
    "receive",
    "putaway",
    "pick",
    "pack",
    "ship",
    "count",
    "move",
    "return"
  ]
}
```

## Dashboard

`GET /mobile/v1/dashboard`

```json
{
  "title": "Los Angeles Warehouse",
  "subtitle": "Live operations",
  "updatedAt": "2026-09-22T18:00:00Z",
  "metrics": [
    { "id": "to_pick", "label": "To Pick", "value": 32 },
    { "id": "exceptions", "label": "Exceptions", "value": 4 }
  ]
}
```

## Tasks

`GET /mobile/v1/tasks?status=open`

`POST /mobile/v1/tasks/:id/complete`

Task mutations are authorized and audited server-side.

## Inventory

`GET /mobile/v1/inventory/search?q=<query>`

Returns normalized inventory records.

## Workflow scan

`POST /mobile/v1/scan`

```json
{
  "operationId": "scan_m...",
  "barcode": "0123456789012",
  "source": "hardware",
  "workflow": "pick",
  "workflowSessionId": "optional-server-session",
  "scannedAt": "2026-09-22T18:00:00Z"
}
```

Example response:

```json
{
  "kind": "inventory",
  "title": "NC-CHAIR-001",
  "message": "Picked 1 of 4",
  "severity": "success",
  "referenceId": "product-123",
  "workflowSessionId": "pick-1028",
  "nextPrompt": "Scan destination tote",
  "workflowComplete": false
}
```

The server should treat `operationId` as an idempotency key.

## Push registration

`POST /mobile/v1/devices/push-token`

```json
{
  "token": "ExponentPushToken[...]",
  "platform": "expo"
}
```

## Required server controls

- HTTPS
- token expiry and revocation
- tenant isolation
- server-side RBAC
- audit logging
- rate limiting
- idempotency for retried mutations
- schema validation
- no secrets in error payloads
