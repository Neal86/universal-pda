# Privacy Baseline

Universal PDA is an enterprise operations client. It processes data returned by business systems configured by the user or organization.

## Data categories

Depending on the connector, the app may process user identity, warehouse and location IDs, inventory, SKU, lot, serial, order, shipment, task, return, barcode, and operational exception data.

## Credentials

Scoped mobile access tokens are stored in the operating system secure credential store. Vendor administrator passwords must not be stored in normal application storage.

## Camera

Camera permission is used for barcode scanning. Normal barcode scanning does not require retaining captured images.

## Local persistence

Non-secret connection metadata and an offline command queue may be persisted on device. Removing a connection removes its secure token and queued operations for that connection.

## Sharing

Operational data is sent only to the configured connector endpoint. Advertising SDKs must not be added without an explicit product decision and privacy review.

## Production URL

Before store submission, publish a finalized privacy policy at a public HTTPS URL and provide a production support contact.
