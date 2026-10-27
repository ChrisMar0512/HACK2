import type { ApiErrorBody } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly traceId?: string
  readonly details: Array<{ field: string; message: string }>

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(body?.message ?? 'No pudimos comunicarnos con la Guild.')
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code ?? 'UNKNOWN_ERROR'
    this.traceId = body?.traceId
    this.details = body?.details ?? []
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string | null
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(500, {
      code: 'MISSING_API_URL',
      message: 'Falta configurar VITE_API_BASE_URL.',
    })
  }

  const { token, body, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)
  headers.set('Accept', 'application/json')
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message: 'No hay conexión con la Guild. Revisa tu red e inténtalo otra vez.',
    })
  }

  if (!response.ok) {
    let body: Partial<ApiErrorBody> | undefined
    try {
      body = (await response.json()) as Partial<ApiErrorBody>
    } catch {
      body = undefined
    }
    if (response.status === 401 && token) window.dispatchEvent(new Event('auth:invalid'))
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

export function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}
