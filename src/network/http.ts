import { ApiError, isRetriableStatus } from './ApiError';
import { buildUrl } from '@/shared/url';

const DEFAULT_TIMEOUT_MS = 12_000;

type JsonRequestOptions = {
  baseUrl: string;
  path: string;
  token?: string | null;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  idempotencyKey?: string;
};

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function requestJson<T>({
  baseUrl,
  path,
  token,
  method = 'GET',
  body,
  query,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  idempotencyKey,
}: JsonRequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof (payload as { message?: unknown }).message === 'string'
          ? (payload as { message: string }).message
          : `Request failed with HTTP ${response.status}.`;

      throw new ApiError(message, response.status, isRetriableStatus(response.status));
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'The request timed out.'
        : error instanceof Error
          ? error.message
          : 'Network request failed.';

    throw new ApiError(message, undefined, true);
  } finally {
    clearTimeout(timeout);
  }
}
