declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_API_BASE_URL?: string
    }
  }
}

const runtimeApiBaseUrl = window.__APP_CONFIG__?.VITE_API_BASE_URL?.trim() ?? ''
const buildTimeApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''
const rawApiBaseUrl = runtimeApiBaseUrl || buildTimeApiBaseUrl

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (!API_BASE_URL) {
    return path
  }

  return path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`
}

export function resolveMediaUrl(url: string | null | undefined) {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return url === '/uploads' || url.startsWith('/uploads/') ? resolveApiUrl(url) : url
}
