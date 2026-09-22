import { describe, expect, it } from 'vitest';
import { buildUrl, normalizeBaseUrl } from './url';

describe('normalizeBaseUrl', () => {
  it('adds https when the scheme is omitted', () => {
    expect(normalizeBaseUrl('example.com/')).toBe('https://example.com');
  });

  it('rejects insecure production endpoints', () => {
    expect(() => normalizeBaseUrl('http://example.com')).toThrow(/HTTPS/);
  });

  it('allows localhost for development', () => {
    expect(normalizeBaseUrl('http://localhost:3000/')).toBe('http://localhost:3000');
  });
});

describe('buildUrl', () => {
  it('encodes query values', () => {
    expect(buildUrl('https://example.com', '/mobile/v1/inventory/search', { q: 'A B' }))
      .toBe('https://example.com/mobile/v1/inventory/search?q=A+B');
  });
});
