export type ScannerSource = 'camera' | 'keyboard-wedge' | 'vendor-sdk' | 'manual';

export type NormalizedScanEvent = {
  value: string;
  source: ScannerSource;
  symbology?: string;
  scannedAt: string;
};

export type ScannerAdapter = {
  id: string;
  label: string;
  start(): Promise<void>;
  stop(): Promise<void>;
};
