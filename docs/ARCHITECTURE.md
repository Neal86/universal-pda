# Architecture

## Design rule

Universal PDA is not tied to a single ERP or WMS. The mobile app depends on normalized contracts only.

## Module boundaries

```text
src/
  app/                  route composition only
  auth/                 session and secure credentials
  connectors/
    core/               vendor-neutral connector contract
    nicec/              NiceC adapter metadata
    odoo/               Odoo adapter metadata
    sap/                SAP adapter metadata
    custom-rest/        custom gateway metadata
  core/                 app-wide orchestration and IDs
  device/
    scanner/
      core/             scanner contract
      camera/           camera adapter
      keyboard-wedge/   industrial PDA HID adapter
  features/             screen-level feature composition
  network/              HTTP transport
  offline/              durable SQLite command queue
  storage/              SQLite schema and repositories
  ui/                   reusable presentation components
  workflows/
    core/
    receive/
    putaway/
    pick/
    pack/
    ship/
    count/
    move/
    returns/
  shared/               pure helpers
```

## Connector boundary

The gateway maps vendor-specific objects and APIs to the mobile protocol. Vendor names and schemas are not allowed in generic workflow, scanner, offline, UI, or core modules.

A connection stores non-secret metadata such as display name, gateway URL, and connector kind. The scoped token is stored separately in OS secure storage.

## Offline safety

Each mutation receives an operation ID before the first network request. Retried operations preserve that ID so the server can enforce idempotency.

The offline queue persists:

- operation ID
- connection ID
- command type
- serialized payload
- attempt count
- next retry time
- last error

It never stores authorization headers or administrator credentials.

## Device boundary

Business workflows do not depend directly on scanner vendor SDKs.

The first production paths are:

- camera barcode scanning
- keyboard-wedge hardware scanning

Future Zebra, Honeywell, Urovo, Chainway, Android Intent, RFID, NFC, and printer integrations stay behind dedicated device adapters.
