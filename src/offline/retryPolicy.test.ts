import { describe, expect, it } from 'vitest';
import { nextRetryIso, retryDelayMs } from './retryPolicy';

describe('retryDelayMs', () => {
  it('backs off exponentially', () => {
    expect(retryDelayMs(1)).toBe(2_000);
    expect(retryDelayMs(2)).toBe(4_000);
    expect(retryDelayMs(3)).toBe(8_000);
  });

  it('caps retry delay', () => {
    expect(retryDelayMs(99)).toBe(300_000);
  });
});

describe('nextRetryIso', () => {
  it('uses the supplied clock', () => {
    expect(nextRetryIso(1, 0)).toBe('1970-01-01T00:00:02.000Z');
  });
});
