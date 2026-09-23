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
  headers?: Record<string, string>;
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

function messageFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  if (
    'message' in payload &&
    typeof (payload as { message?: unknown }).message === 'string'
  ) {
    return (payload as { message: string }).message;
  }

  if ('error' in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string') return error;
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }
  }

  return null;
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
  headers,
}: JsonRequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(baseUrl, path, query), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-WMS-Client': 'mobile',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        ...(headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(
        messageFromPayload(payload) ?? `Request failed with HTTP ${response.status}.`,
        response.status,
        isRetriableStatus(response.status),
      );
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
