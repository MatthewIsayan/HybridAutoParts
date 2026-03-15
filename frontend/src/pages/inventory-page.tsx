import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PartCard } from '@/components/part-card'
import { Button } from '@/components/ui/button'
import { fetchInventoryPage, publicQueryKeys } from '@/lib/public-api'
import { useSearchParams } from 'react-router-dom'

const PAGE_SIZE = 12
const EXAMPLE_SEARCHES = ['2019 camry camera', 'tesla heater core', 'model 3 mirror']

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value ?? '0', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const activeSearch = searchParams.get('search')?.trim() ?? ''
  const [searchDraft, setSearchDraft] = useState(activeSearch)

  useEffect(() => {
    setSearchDraft(activeSearch)
  }, [activeSearch])

  const inventoryQuery = useQuery({
    queryKey: publicQueryKeys.inventory({ page, size: PAGE_SIZE, search: activeSearch }),
    queryFn: () => fetchInventoryPage({ page, size: PAGE_SIZE, search: activeSearch }),
    placeholderData: keepPreviousData,
  })

  const results = inventoryQuery.data
  const content = results?.content ?? []
  const currentPage = results?.page ?? page
  const totalPages = results?.totalPages ?? 0
  const totalElements = results?.totalElements ?? 0

  function updateSearchParams(nextPage: number, nextSearch: string) {
    const params = new URLSearchParams()

    if (nextPage > 0) {
      params.set('page', String(nextPage))
    }

    if (nextSearch.trim().length > 0) {
      params.set('search', nextSearch.trim())
    }

    setSearchParams(params)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateSearchParams(0, searchDraft)
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Public inventory</p>
        <h1 className="text-3xl font-semibold tracking-tight">Browse available parts</h1>
        <p className="max-w-3xl text-muted-foreground">
          Search the seeded inventory by SKU, title, manufacturer, or vehicle details. Pagination is backed by the
          public API so the browsing surface can scale beyond the initial sample data.
        </p>
      </div>

      <form className="grid gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
        <div>
          <label className="sr-only" htmlFor="inventory-search">
            Search inventory
          </label>
          <input
            id="inventory-search"
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search by SKU, title, make, model, year, or manufacturer"
            className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_SEARCHES.map((searchExample) => (
          <button
            key={searchExample}
            type="button"
            onClick={() => updateSearchParams(0, searchExample)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            {searchExample}
          </button>
        ))}
      </div>

      {activeSearch ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Active search:</span>
          <span className="rounded-full bg-background px-3 py-1 text-muted-foreground">{activeSearch}</span>
          <Button type="button" variant="outline" onClick={() => updateSearchParams(0, '')}>
            Clear search
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {results
            ? `${totalElements} part${totalElements === 1 ? '' : 's'} found${activeSearch ? ` for "${activeSearch}"` : ''}.`
            : 'Loading inventory...'}
        </p>
        {results ? (
          <p>
            Page {currentPage + 1} of {Math.max(totalPages, 1)}
          </p>
        ) : null}
      </div>

      {inventoryQuery.isError ? (
        <div className="rounded-3xl border border-destructive/30 bg-card px-6 py-10 text-center text-muted-foreground">
          Inventory data could not be loaded right now.
        </div>
      ) : null}

      {results && content.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {content.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      ) : null}

      {results && content.length === 0 && !inventoryQuery.isError ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center text-muted-foreground">
          No parts matched this search yet. Try another make, model, SKU, or year.
        </div>
      ) : null}

      {results && totalPages > 1 ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={results.first}
              onClick={() => updateSearchParams(page - 1, activeSearch)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={results.last}
              onClick={() => updateSearchParams(page + 1, activeSearch)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
