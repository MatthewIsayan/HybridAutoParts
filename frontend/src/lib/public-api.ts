import type { BootstrapResponse, CompanyConfig, Part, PartPage, PartPageQuery } from '@/types/api'
import { requestJson } from '@/lib/http'

export function fetchBootstrap() {
  return requestJson<BootstrapResponse>('/api/public/bootstrap')
}

export function fetchCompanyConfig() {
  return requestJson<CompanyConfig>('/api/public/company')
}

export function fetchInventoryPage(query: PartPageQuery = {}) {
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

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : ''
  return requestJson<PartPage>(`/api/public/parts${suffix}`)
}

export function fetchPart(partId: string) {
  return requestJson<Part>(`/api/public/parts/${partId}`)
}

export const publicQueryKeys = {
  bootstrap: ['public', 'bootstrap'] as const,
  company: ['public', 'company'] as const,
  inventory: (query?: PartPageQuery) =>
    ['public', 'inventory', query?.page ?? 0, query?.size ?? 12, query?.search ?? ''] as const,
  part: (partId: string) => ['public', 'part', partId] as const,
}
