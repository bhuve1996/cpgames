const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getApiUrl() {
  return API_URL;
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    const msg = body.message;
    const text = Array.isArray(msg)
      ? msg.map(String).join(', ')
      : typeof msg === 'string'
        ? msg
        : res.statusText;
    throw new Error(text || 'Request failed');
  }

  return res.json();
}
