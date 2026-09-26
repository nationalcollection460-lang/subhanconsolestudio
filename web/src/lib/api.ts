export type Json = Record<string, any>;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...(isForm || !options.body ? {} : { 'Content-Type': 'application/json' }),
        ...((options.headers as Record<string, string>) || {}),
      },
    });
  } catch {
    throw new ApiError('We could not reach the server. Please check your internet connection.', 0);
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message =
      data?.error ||
      (res.status === 401
        ? 'Please sign in to continue.'
        : `Request failed (${res.status}). Please try again.`);
    throw new ApiError(message, res.status);
  }

  return (data ?? {}) as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: (file: File, folder = 'uploads') => {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    return request<{ ok: boolean; url: string; key: string }>('/admin/upload', { method: 'POST', body: form });
  },
};
