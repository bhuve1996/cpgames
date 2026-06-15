/** Normalize any thrown value into a user-readable string. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message;
  if (err instanceof Event) return fallback;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (Array.isArray(record.message)) return record.message.map(String).join(', ');
  }
  return fallback;
}
