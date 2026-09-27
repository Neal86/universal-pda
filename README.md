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
npm ci
npm run check
```

`npm run check` runs ESLint, strict TypeScript typecheck, and unit tests. The same gate runs in GitHub Actions on `develop` and `main`.

For a deployed NiceC gateway, a read-only connector smoke check is available:

```bash
PDA_BASE_URL=https://<gateway> \
PDA_USERNAME=<warehouse-user> \
PDA_PASSWORD=<password> \
npm run smoke:nicec
```

Run Expo Doctor again in the final EAS-linked release environment before the first signed build.

## Release foundation

- secure multi-system connections
- dashboard, tasks, and inventory
- workflow-aware barcode scanning
- camera scanning
- industrial PDA keyboard-wedge scanning
- durable SQLite offline command queue
- normalized connector contract
- real NiceC credential exchange and warehouse switching
- receive / putaway / pick / pack / ship / count / move / return workflows
- offline retry + Needs Attention recovery
- strict vendor isolation
- Android/iOS production identifiers
- EAS build profiles
- GitHub Actions quality gate

Product requirements live in `docs/PRD.md` and must stay synchronized with implementation changes.

See `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/CONNECTOR_PROTOCOL.md`, and `docs/RELEASE.md`.
