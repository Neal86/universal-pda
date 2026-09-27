#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function requireFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required release file: ${file}`);
  }
  if (fs.statSync(full).size === 0) {
    throw new Error(`Required release file is empty: ${file}`);
  }
}

const pkg = readJson('package.json');
const app = readJson('app.json');
const eas = readJson('eas.json');
const expo = app.expo || {};

if (!expo.name || !expo.slug || !expo.version) {
  throw new Error('app.json is missing name, slug, or version.');
}

if (pkg.version !== expo.version) {
  throw new Error(
    `Version mismatch: package.json=${pkg.version}, app.json=${expo.version}`,
  );
}

if (!expo.ios?.bundleIdentifier) {
  throw new Error('Missing iOS bundleIdentifier.');
}
if (!expo.android?.package) {
  throw new Error('Missing Android package identifier.');
}
if (!Number.isInteger(expo.android?.versionCode) || expo.android.versionCode < 1) {
  throw new Error('Android versionCode must be a positive integer.');
}

for (const profile of ['development', 'preview', 'production']) {
  if (!eas.build?.[profile]) {
    throw new Error(`Missing EAS build profile: ${profile}`);
  }
}
if (!eas.submit?.production) {
  throw new Error('Missing EAS production submit profile.');
}

for (const file of [
  'assets/icon.png',
  'assets/android-icon-foreground.png',
  'assets/android-icon-background.png',
  'assets/android-icon-monochrome.png',
  'docs/PRIVACY.md',
  'docs/RELEASE.md',
  'docs/STORE_LISTING.md',
  'docs/STORE_PRIVACY_DATA.md',
]) {
  requireFile(file);
}

console.log('Release configuration verification passed.');
console.log(`App: ${expo.name} ${expo.version}`);
console.log(`iOS: ${expo.ios.bundleIdentifier}`);
console.log(`Android: ${expo.android.package} (versionCode ${expo.android.versionCode})`);

const projectId =
  expo.extra?.eas?.projectId ||
  expo.extra?.easProjectId ||
  null;

if (!projectId) {
  console.log(
    'WAITING: Expo/EAS project ID is not configured. Link the owner Expo project before signed cloud builds.',
  );
} else {
  console.log(`EAS project: ${projectId}`);
}

console.log(
  'WAITING: Apple signing/App Store Connect and Google Play signing/submission credentials are external release requirements.',
);
