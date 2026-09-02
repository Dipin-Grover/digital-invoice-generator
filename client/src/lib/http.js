const API_ERROR_FALLBACK = 'Request failed. Please try again.';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function http(path, { token, method = 'GET', body, headers } = {}) {
  const baseHeaders = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };

  const fullUrl = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const res = await fetch(fullUrl, {
    method,
    headers: baseHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      API_ERROR_FALLBACK;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}