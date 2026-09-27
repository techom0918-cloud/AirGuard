import { API_BASE_URL } from '../config/api';

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function request<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { timeoutMs = 10000, headers, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  try {
    const response = await fetch(url, {
      ...customConfig,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        `HTTP Request failed with status ${response.status}`;
      throw new ApiError(response.status, message);
    }

    return data as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, `Request timeout after ${timeoutMs}ms for ${url}`);
    }

    const message =
      error instanceof Error ? error.message : 'Network failure or API server unreachable';
    throw new ApiError(500, message);
  }
}

export const apiClient = {
  get<T>(path: string, options?: ApiClientOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body: unknown, options?: ApiClientOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
