# Release Readiness

## Code gates

A release candidate must pass:

- TypeScript strict typecheck
- ESLint
- unit tests
- Expo Doctor

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

## Hardware acceptance

Before rollout:

- verify camera scan on physical iOS and Android devices
- verify hardware scan on at least one industrial Android PDA
- configure keyboard-wedge scanners to append Enter
- verify offline queue survives app restart
- verify token removal when a connection is removed
- verify retry/idempotency against a real connector
- verify receive, putaway, pick, pack, ship, count, move, and return workflows using production-like data
