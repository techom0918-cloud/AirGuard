const rawBaseUrl = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) || 'http://localhost:5001/api';

/**
 * Centralized API Base URL configuration.
 * Normalizes any trailing slashes.
 */
export const API_BASE_URL: string = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
