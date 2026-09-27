# Universal PDA — Store Privacy / Data Safety Working Sheet

This file is a release-preparation worksheet, not a legal determination. Final answers must match the production build, enabled connectors, public privacy policy, and actual backend behavior at submission time.

## Data used by the app

Potentially processed depending on the connected business system:

- Account identity: user ID, username/display name, role
- Enterprise identifiers: organization, warehouse, location/bin
- Product and inventory data: SKU, barcode, lot, serial, quantity
- Operational data: tasks, inbound/outbound records, shipment and return status
- Diagnostic/operational errors needed for workflow recovery
- Push notification token after the user enables notifications

## Credentials and authentication

- ERP/WMS administrator credentials must not be persisted by Universal PDA.
- NiceC credential login exchanges username/password for a scoped mobile token.
- The password is discarded after token exchange.
- Scoped access tokens are stored using OS secure storage.
- Authorization headers and passwords are excluded from the offline queue.

## Camera

Purpose: barcode scanning.

Expected behavior:

- Camera permission is requested only when camera scanning is used.
- Normal scanning does not require retaining photos or video.
- No microphone/audio capture is required for barcode scanning.

## Local storage

The app may persist:

- Non-secret connection metadata
- Active warehouse/workspace metadata
- Offline replay-safe commands
- Retry/error state required for operator recovery

Removing a connection must remove its scoped secure token and queued operations.

## Network sharing

Operational data is sent to the business-system connector endpoint selected/configured by the user or organization.

Current baseline:

- No advertising SDKs
- No cross-app advertising tracking
- No sale of user data by the app
- No unnecessary analytics SDK is required by the product architecture

If analytics, crash-reporting, advertising, or third-party identity SDKs are later added, this worksheet and the public privacy policy must be reviewed again before release.

## Apple App Privacy preparation

Likely categories to review in App Store Connect:

- Contact Info only if a connector returns user email or operational contact information to the app
- User ID / account identifiers
- Product interaction / app functionality data
- Other enterprise operational data
- Diagnostics only if crash/diagnostic telemetry is later enabled

For every selected category, determine whether it is:
- linked to the user
- used for tracking
- collected by the developer
- used only for app functionality

Do not mark a category as collected unless the production app/backend actually sends it to the developer or a third party under Apple's definitions.

## Google Play Data safety preparation

Confirm at submission time:

- whether data is collected
- whether data is shared
- encryption in transit
- account/data deletion path where applicable
- data categories and purposes
- whether collection is optional or required

The production connector must use HTTPS.

## Release blockers

Before public store submission, finalize:

- public HTTPS privacy policy
- support URL
- support contact
- production backend/connector domains
- final enabled SDK list
- final push notification behavior
- final retention/deletion behavior
