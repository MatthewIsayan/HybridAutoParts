import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { adminQueryKeys, deleteAdminPart, fetchAdminParts, updateAdminPartStatus } from '@/lib/admin-api'
import { useAdminAuth } from '@/lib/auth'
import { ApiClientError } from '@/lib/http'

const PAGE_SIZE = 20

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function AdminPartsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { adminToken } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [pageNotice, setPageNotice] = useState<string | null>(null)
  const page = parsePage(searchParams.get('page'))
  const activeSearch = searchParams.get('search')?.trim() ?? ''
  const activeStatus = searchParams.get('status')?.trim() ?? ''
  const [searchDraft, setSearchDraft] = useState(activeSearch)

  useEffect(() => {
    setSearchDraft(activeSearch)
  }, [activeSearch])

  useEffect(() => {
    const nextNotice = (location.state as { notice?: string } | null)?.notice
    if (!nextNotice) {
      return
    }

    setPageNotice(nextNotice)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.pathname, location.search, location.state, navigate])

  const partsQuery = useQuery({
    queryKey: adminQueryKeys.parts({ page, size: PAGE_SIZE, search: activeSearch, status: activeStatus }),
    queryFn: () => fetchAdminParts(adminToken ?? '', { page, size: PAGE_SIZE, search: activeSearch, status: activeStatus }),
    enabled: Boolean(adminToken),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: (partId: string) => deleteAdminPart(adminToken ?? '', partId),
    onSuccess: async () => {
      setPendingDeleteId(null)
      setPageNotice('Part deleted.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
      ])
    },
    onError: (error) => {
      setPageNotice(resolveMutationError(error, 'Part delete failed.'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ partId, status }: { partId: string; status: string }) =>
      updateAdminPartStatus(adminToken ?? '', partId, { status }),
    onSuccess: async (_, variables) => {
      setPageNotice(`Part status updated to ${variables.status}.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.part(variables.partId) }),
        queryClient.invalidateQueries({ queryKey: ['public', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'part'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
      ])
    },
    onError: (error) => {
      setPageNotice(resolveMutationError(error, 'Part status update failed.'))
    },
  })

  const results = partsQuery.data
  const parts = results?.content ?? []
  const isRefreshing = partsQuery.isFetching && !partsQuery.isLoading

  const totalLabel = useMemo(() => {
    const total = results?.totalElements ?? 0
    return `${total} part${total === 1 ? '' : 's'}`
  }, [results?.totalElements])

  function updateParams(nextPage: number, nextSearch: string, nextStatus: string) {
    const params = new URLSearchParams()

    if (nextPage > 0) {
      params.set('page', String(nextPage))
    }

    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim())
    }

    if (nextStatus.trim()) {
      params.set('status', nextStatus.trim())
    }

    setSearchParams(params)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateParams(0, searchDraft, activeStatus)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Inventory manager</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage all parts</h1>
          <p className="mt-3 text-slate-300">Search inventory, adjust status, and confirm delete actions from one view.</p>
        </div>
        <Button asChild>
          <Link to="/admin/parts/new">Create part</Link>
        </Button>
      </div>

      {pageNotice ? (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{pageNotice}</div>
      ) : null}

      <form className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_220px_auto]" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Search by SKU, title, make, or model"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
        />
        <select
          aria-label="Filter by status"
          value={activeStatus}
          onChange={(event) => updateParams(0, searchDraft, event.target.value)}
          className="h-11 rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="HOLD">Hold</option>
          <option value="SOLD">Sold</option>
        </select>
        <Button type="submit">Search</Button>
      </form>

      {(activeSearch || activeStatus) ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-slate-200">
          <span className="font-medium">Active filters:</span>
          {activeSearch ? <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">Search: {activeSearch}</span> : null}
          {activeStatus ? <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">Status: {activeStatus}</span> : null}
          <Button type="button" variant="adminOutline" onClick={() => updateParams(0, '', '')}>
            Clear filters
          </Button>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm text-slate-400">
        <p>{partsQuery.isLoading ? 'Loading parts...' : `${totalLabel} in admin inventory.`}</p>
        {results ? (
          <p>
            {isRefreshing ? 'Refreshing inventory...' : `Page ${(results.page ?? 0) + 1} of ${Math.max(results.totalPages ?? 1, 1)}`}
          </p>
        ) : null}
      </div>

      {partsQuery.isError ? (
        <div className="space-y-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-6 py-10 text-center text-rose-100">
          <p>Admin inventory could not be loaded right now.</p>
          <div className="flex justify-center">
            <Button type="button" variant="adminOutline" onClick={() => partsQuery.refetch()}>
              Retry inventory
            </Button>
          </div>
        </div>
      ) : null}

      {results && parts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 px-6 py-10 text-center text-slate-300">
          No parts matched this admin search.
        </div>
      ) : null}

      {parts.length > 0 ? (
        <>
          <div className="grid gap-4 md:hidden">
            {parts.map((part) => {
              const vehicleLabel = [part.vehicleYear, part.vehicleMake, part.vehicleModel].filter(Boolean).join(' ')
              const isDeleting = pendingDeleteId === part.id

              return (
                <article key={part.id} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-50">{part.title}</p>
                    <p className="text-sm text-slate-400">{part.sku}</p>
                    <p className="text-sm text-slate-300">{vehicleLabel || 'Vehicle details pending'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
                      {part.status}
                    </span>
                    <span>${Number(part.price ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm text-slate-300">
                      <span className="mb-2 block">Quick status</span>
                      <select
                        value={part.status ?? 'AVAILABLE'}
                        onChange={(event) => statusMutation.mutate({ partId: String(part.id), status: event.target.value })}
                        disabled={statusMutation.isPending}
                        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="HOLD">Hold</option>
                        <option value="SOLD">Sold</option>
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="adminOutline">
                        <Link to={`/admin/parts/${part.id}/edit`}>Edit</Link>
                      </Button>
                      {isDeleting ? (
                        <>
                          <Button type="button" onClick={() => deleteMutation.mutate(String(part.id))} disabled={deleteMutation.isPending}>
                            Confirm delete
                          </Button>
                          <Button type="button" variant="adminOutline" onClick={() => setPendingDeleteId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button type="button" variant="adminOutline" onClick={() => setPendingDeleteId(part.id ?? null)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 md:block">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Part</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {parts.map((part) => {
                const vehicleLabel = [part.vehicleYear, part.vehicleMake, part.vehicleModel].filter(Boolean).join(' ')
                const isDeleting = pendingDeleteId === part.id

                return (
                  <tr key={part.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-slate-50">{part.title}</p>
                      <p className="mt-1 text-slate-400">{part.sku}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-300">{vehicleLabel || 'Vehicle details pending'}</td>
                    <td className="px-4 py-4 align-top">
                      <select
                        aria-label={`Update status for ${part.title}`}
                        value={part.status ?? 'AVAILABLE'}
                        onChange={(event) => statusMutation.mutate({ partId: String(part.id), status: event.target.value })}
                        disabled={statusMutation.isPending}
                        className="h-10 min-w-[150px] rounded-xl border border-slate-700 bg-slate-950 px-3 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="HOLD">Hold</option>
                        <option value="SOLD">Sold</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-300">${Number(part.price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="adminOutline">
                          <Link to={`/admin/parts/${part.id}/edit`}>Edit</Link>
                        </Button>
                        {isDeleting ? (
                          <>
                            <Button
                              type="button"
                              onClick={() => deleteMutation.mutate(String(part.id))}
                              disabled={deleteMutation.isPending}
                            >
                              Confirm delete
                            </Button>
                            <Button type="button" variant="adminOutline" onClick={() => setPendingDeleteId(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button type="button" variant="adminOutline" onClick={() => setPendingDeleteId(part.id ?? null)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
          </div>
        </>
      ) : null}

      {results && (results.totalPages ?? 0) > 1 ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">Navigate through the protected inventory results.</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="adminOutline"
              disabled={results.first}
              onClick={() => updateParams(page - 1, activeSearch, activeStatus)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="adminOutline"
              disabled={results.last}
              onClick={() => updateParams(page + 1, activeSearch, activeStatus)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function resolveMutationError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiClientError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
