const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

export function normalizeBaseUrl(input: string): string {
  const raw = input.trim();
  if (!raw) {
    throw new Error('Server URL is required.');
  }

  const value = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(value);
  const isLocalDevelopment = LOCAL_HOSTS.has(parsed.hostname);

  if (parsed.protocol !== 'https:' && !isLocalDevelopment) {
    throw new Error('Production connections must use HTTPS.');
  }

  parsed.hash = '';
  parsed.search = '';
  return parsed.toString().replace(/\/$/, '');
}

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${cleanPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
