const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 5 * 60_000;
export const MAX_RETRY_ATTEMPTS = 8;

export function retryDelayMs(attempts: number): number {
  const exponent = Math.max(0, attempts - 1);
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** exponent);
}

export function nextRetryIso(attempts: number, now = Date.now()): string {
  return new Date(now + retryDelayMs(attempts)).toISOString();
}
