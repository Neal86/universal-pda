# Release Readiness

## Code gates

A release candidate must pass:

- `npm ci`
- `npm run check` (ESLint + strict TypeScript + unit tests)
- GitHub Actions CI
- Expo Doctor in the EAS-ready environment

Current `develop` passes `npm run check` and GitHub Actions CI. Expo Doctor remains a release-environment gate because the final EAS project link/signing context is not configured yet.

## EAS

`eas.json` contains development, preview, and production profiles.

Before the first cloud build, link this repository to the owner's Expo/EAS project so the EAS project ID can be added to app configuration.

## Store/account items required from the owner

### Apple

- Apple Developer Program account
- App Store Connect app record
- signing credentials
- final screenshots and metadata
- public privacy-policy URL
- support URL
- privacy questionnaire

### Google Play

- Play Console developer account
- app record
- signing configuration managed by EAS/Google Play
- final screenshots and listing assets
- public privacy-policy URL
- Data safety form

## NiceC deployment smoke

After the paired NiceC Gateway/Odoo module is deployed and upgraded, run the read-only smoke command with a warehouse test account:

```bash
PDA_BASE_URL=https://<nicec-gateway> \
PDA_USERNAME=<warehouse-user> \
PDA_PASSWORD=<password> \
npm run smoke:nicec
```

If the account has multiple warehouses and no active warehouse, also set `PDA_WAREHOUSE_ID`. Set `PDA_BARCODE` only when you want the smoke run to exercise Identify.

The smoke runner does not persist credentials. Full mutation workflows must still be verified with designated test orders/inventory before production rollout.

## Hardware acceptance

Before rollout:

- verify camera scan on physical iOS and Android devices
- verify hardware scan on at least one industrial Android PDA
- configure keyboard-wedge scanners to append Enter
- verify offline queue survives app restart
- verify token removal when a connection is removed
- verify retry/idempotency against a real connector
- verify receive, putaway, pick, pack, ship, count, move, and return workflows using production-like data
