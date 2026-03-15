import { requestJson, requestVoid } from '@/lib/http'
import type {
  AdminCompanyConfigRequest,
  AdminPartImageList,
  AdminPartImageOrderRequest,
  AdminLoginRequest,
  AdminPart,
  AdminPartPage,
  AdminPartPageQuery,
  AdminPartRequest,
  AdminPartStatusRequest,
  AdminSession,
  CompanyConfig,
} from '@/types/api'

export function loginAdmin(credentials: AdminLoginRequest) {
  return requestJson<AdminSession>('/api/admin/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

export function fetchAdminParts(token: string, query: AdminPartPageQuery = {}) {
  const searchParams = new URLSearchParams()

  if (query.page !== undefined) {
    searchParams.set('page', String(query.page))
  }

  if (query.size !== undefined) {
    searchParams.set('size', String(query.size))
  }

  if (query.search && query.search.trim().length > 0) {
    searchParams.set('search', query.search.trim())
  }

  if (query.status && query.status.trim().length > 0) {
    searchParams.set('status', query.status.trim())
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : ''
  return requestJson<AdminPartPage>(`/api/admin/parts${suffix}`, { token })
}

export function fetchAdminPart(token: string, partId: string) {
  return requestJson<AdminPart>(`/api/admin/parts/${partId}`, { token })
}

export function fetchAdminPartImages(token: string, partId: string) {
  return requestJson<AdminPartImageList>(`/api/admin/parts/${partId}/images`, { token })
}

export function createAdminPart(token: string, body: AdminPartRequest) {
  return requestJson<AdminPart>('/api/admin/parts', {
    method: 'POST',
    body,
    token,
  })
}

export function updateAdminPart(token: string, partId: string, body: AdminPartRequest) {
  return requestJson<AdminPart>(`/api/admin/parts/${partId}`, {
    method: 'PUT',
    body,
    token,
  })
}

export function updateAdminPartStatus(token: string, partId: string, body: AdminPartStatusRequest) {
  return requestJson<AdminPart>(`/api/admin/parts/${partId}/status`, {
    method: 'PATCH',
    body,
    token,
  })
}

export function uploadAdminPartImages(token: string, partId: string, files: File[], altTexts: string[] = []) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const searchParams = new URLSearchParams()
  for (const altText of altTexts) {
    if (altText.trim().length > 0) {
      searchParams.append('altTexts', altText.trim())
    }
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : ''
  return requestJson<AdminPart>(`/api/admin/parts/${partId}/images${suffix}`, {
    method: 'POST',
    body: formData,
    token,
  })
}

export function reorderAdminPartImages(token: string, partId: string, body: AdminPartImageOrderRequest) {
  return requestJson<AdminPart>(`/api/admin/parts/${partId}/images/order`, {
    method: 'PATCH',
    body,
    token,
  })
}

export function deleteAdminPart(token: string, partId: string) {
  return requestVoid(`/api/admin/parts/${partId}`, {
    method: 'DELETE',
    token,
  })
}

export function deleteAdminPartImage(token: string, partId: string, imageId: string) {
  return requestJson<AdminPart>(`/api/admin/parts/${partId}/images/${imageId}`, {
    method: 'DELETE',
    token,
  })
}

export function fetchAdminCompanyConfig(token: string) {
  return requestJson<CompanyConfig>('/api/admin/company', { token })
}

export function updateAdminCompanyConfig(token: string, body: AdminCompanyConfigRequest) {
  return requestJson<CompanyConfig>('/api/admin/company', {
    method: 'PUT',
    body,
    token,
  })
}

export const adminQueryKeys = {
  parts: (query?: AdminPartPageQuery) =>
    ['admin', 'parts', query?.page ?? 0, query?.size ?? 20, query?.search ?? '', query?.status ?? ''] as const,
  part: (partId: string) => ['admin', 'part', partId] as const,
  partImages: (partId: string) => ['admin', 'part-images', partId] as const,
  company: ['admin', 'company'] as const,
}
