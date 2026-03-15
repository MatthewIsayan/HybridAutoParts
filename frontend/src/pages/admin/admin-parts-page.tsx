import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { adminQueryKeys, deleteAdminPart, fetchAdminParts, updateAdminPartStatus } from '@/lib/admin-api'
import { useAdminAuth } from '@/lib/auth'

const PAGE_SIZE = 20

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function AdminPartsPage() {
  const queryClient = useQueryClient()
  const { adminToken } = useAdminAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const page = parsePage(searchParams.get('page'))
  const activeSearch = searchParams.get('search')?.trim() ?? ''
  const activeStatus = searchParams.get('status')?.trim() ?? ''
  const [searchDraft, setSearchDraft] = useState(activeSearch)

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
      ])
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ partId, status }: { partId: string; status: string }) =>
      updateAdminPartStatus(adminToken ?? '', partId, { status }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.part(variables.partId) }),
        queryClient.invalidateQueries({ queryKey: ['public', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'part'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
      ])
    },
  })

  const results = partsQuery.data
  const parts = results?.content ?? []

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

      <div className="flex items-center justify-between text-sm text-slate-400">
        <p>{partsQuery.isLoading ? 'Loading parts...' : `${totalLabel} in admin inventory.`}</p>
        {results ? (
          <p>
            Page {(results.page ?? 0) + 1} of {Math.max(results.totalPages ?? 1, 1)}
          </p>
        ) : null}
      </div>

      {partsQuery.isError ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-6 py-10 text-center text-rose-100">
          Admin inventory could not be loaded right now.
        </div>
      ) : null}

      {results && parts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 px-6 py-10 text-center text-slate-300">
          No parts matched this admin search.
        </div>
      ) : null}

      {parts.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
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
                const nextStatus = part.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE'

                return (
                  <tr key={part.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-slate-50">{part.title}</p>
                      <p className="mt-1 text-slate-400">{part.sku}</p>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-300">{vehicleLabel || 'Vehicle details pending'}</td>
                    <td className="px-4 py-4 align-top">
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
                        {part.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-300">${Number(part.price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="adminOutline">
                          <Link to={`/admin/parts/${part.id}/edit`}>Edit</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="adminOutline"
                          onClick={() => statusMutation.mutate({ partId: String(part.id), status: nextStatus })}
                          disabled={statusMutation.isPending}
                        >
                          Mark {nextStatus.toLowerCase()}
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
      ) : null}

      {results && (results.totalPages ?? 0) > 1 ? (
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-4">
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
