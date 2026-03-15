import { ADMIN_SESSION_EXPIRED_EVENT } from '@/lib/auth'

export class ApiClientError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface RequestJsonOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  const headers = new Headers()
  const requestBody = buildRequestBody(options.body, headers)

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: requestBody,
  })

  const payload = await readResponsePayload(response)

  if (!response.ok) {
    notifyUnauthorizedSession(options.token, response.status)
    throw new ApiClientError(payload.message ?? `Request failed for ${path}`, response.status, payload.fieldErrors)
  }

  return payload.data as T
}

export async function requestVoid(path: string, options: RequestJsonOptions = {}) {
  const headers = new Headers()
  const requestBody = buildRequestBody(options.body, headers)

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(path, {
    method: options.method ?? 'DELETE',
    headers,
    body: requestBody,
  })

  const payload = await readResponsePayload(response)

  if (!response.ok) {
    notifyUnauthorizedSession(options.token, response.status)
    throw new ApiClientError(payload.message ?? `Request failed for ${path}`, response.status, payload.fieldErrors)
  }
}

function buildRequestBody(body: unknown, headers: Headers) {
  if (body === undefined) {
    return undefined
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body
  }

  headers.set('Content-Type', 'application/json')
  return JSON.stringify(body)
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return {
      data: null,
      message: response.ok ? undefined : response.statusText,
      fieldErrors: {},
    }
  }

  const data = (await response.json()) as {
    message?: string
    fieldErrors?: Record<string, string>
  }

  return {
    data,
    message: data.message,
    fieldErrors: data.fieldErrors ?? {},
  }
}

function notifyUnauthorizedSession(token: string | undefined, status: number) {
  if (typeof window === 'undefined' || !token || status !== 401) {
    return
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT))
}
