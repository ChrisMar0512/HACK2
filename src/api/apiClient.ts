import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/api.types';

export const TOKEN_STORAGE_KEY = 'logpose_token';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn('Advertencia: VITE_API_BASE_URL no está definida en las variables de entorno.');
}

export const apiClient = axios.create({
  baseURL: baseURL || 'https://logpose-api-jg7f.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('logpose:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback: string = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
