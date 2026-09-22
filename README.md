# Universal PDA

Universal PDA is a cross-platform operations app for Android, iOS, tablets, and industrial Android PDAs.

It connects to ERP, WMS, OMS, and other business systems through a normalized connector contract instead of hardcoding one vendor into the mobile client.

## Product goal

One app can run warehouse and operational workflows against different systems, including NiceC WMS, Odoo, SAP, NetSuite, Microsoft Dynamics, Shopify, and custom gateways.

## Architecture

```text
Mobile UI
  -> feature modules
  -> workflow modules
  -> connector contract
  -> normalized mobile API
  -> vendor adapter / enterprise system

Device input
  -> scanner adapter
  -> normalized scan event
  -> workflow module
```

The app does not store ERP/WMS administrator credentials. Scoped mobile tokens are stored in OS secure storage.

## Branches

- `main`: release-stable
- `develop`: active development

GitHub is the source of truth for code. Development code is not maintained through Lucas or an uncommitted workstation copy.

## Quality commands

```bash
npm install
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

## Release foundation

- secure multi-system connections
- dashboard, tasks, and inventory
- workflow-aware barcode scanning
- camera scanning
- industrial PDA keyboard-wedge scanning
- durable SQLite offline command queue
- normalized connector contract
- strict vendor isolation
- Android/iOS production identifiers
- EAS build profiles

See `docs/ARCHITECTURE.md`, `docs/CONNECTOR_PROTOCOL.md`, and `docs/RELEASE.md`.
