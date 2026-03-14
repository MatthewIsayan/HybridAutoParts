import type { BootstrapResponse, CompanyConfig, Part, PartPage, PartPageQuery } from '@/types/api'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`)
  }

  return (await response.json()) as T
}

export function fetchBootstrap() {
  return fetchJson<BootstrapResponse>('/api/public/bootstrap')
}

export function fetchCompanyConfig() {
  return fetchJson<CompanyConfig>('/api/public/company')
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
  return fetchJson<PartPage>(`/api/public/parts${suffix}`)
}

export function fetchPart(partId: string) {
  return fetchJson<Part>(`/api/public/parts/${partId}`)
}

export const publicQueryKeys = {
  bootstrap: ['public', 'bootstrap'] as const,
  company: ['public', 'company'] as const,
  inventory: (query?: PartPageQuery) =>
    ['public', 'inventory', query?.page ?? 0, query?.size ?? 12, query?.search ?? ''] as const,
  part: (partId: string) => ['public', 'part', partId] as const,
}
