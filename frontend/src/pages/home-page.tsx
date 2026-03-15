import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PartCard } from '@/components/part-card'
import { fetchBootstrap, publicQueryKeys } from '@/lib/public-api'

export function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const bootstrapQuery = useQuery({
    queryKey: publicQueryKeys.bootstrap,
    queryFn: fetchBootstrap,
  })

  const company = bootstrapQuery.data?.company
  const featuredParts = bootstrapQuery.data?.featuredParts ?? []

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = search.trim()
    navigate(trimmed ? `/inventory?search=${encodeURIComponent(trimmed)}` : '/inventory')
  }

  function runExampleSearch(value: string) {
    navigate(`/inventory?search=${encodeURIComponent(value)}`)
  }

  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-sm md:grid-cols-[1.5fr_1fr] md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Public inventory browsing</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {company?.heroHeadline ?? 'Browse recycled OEM inventory with confidence'}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {company?.heroSubheadline ?? 'Search seeded parts, explore detailed listings, and contact the yard directly.'}
          </p>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="home-search">
              Search inventory
            </label>
            <input
              id="home-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by SKU, make, model, year, or title"
              className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button type="submit" size="lg">
              Search inventory
            </Button>
          </form>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/inventory">Browse all inventory</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Contact the yard</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['2019 camry camera', 'model 3 mirror', 'tesla heater core'].map((searchExample) => (
              <button
                key={searchExample}
                type="button"
                onClick={() => runExampleSearch(searchExample)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {searchExample}
              </button>
            ))}
          </div>
          {bootstrapQuery.isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Live homepage data could not be loaded. Fallback copy is being shown instead.
            </div>
          ) : null}
        </div>
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-sm font-medium text-muted-foreground">Company profile</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Business</dt>
              <dd>{company?.companyName ?? 'Loading company details...'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Support</dt>
              <dd>{company?.supportEmail ?? 'Loading support email...'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{company?.phone ?? 'Loading phone number...'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd>
                {company
                  ? `${company.city}, ${company.state}`
                  : 'Loading business location...'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured inventory</h2>
            <p className="text-muted-foreground">Highlighted seeded parts from the public bootstrap endpoint.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {bootstrapQuery.isError ? 'Featured inventory is temporarily unavailable.' : 'Live public data connected.'}
          </p>
        </div>

        {bootstrapQuery.isLoading ? (
          <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center text-muted-foreground">
            Loading featured inventory...
          </div>
        ) : null}

        {bootstrapQuery.isError ? (
          <div className="space-y-4 rounded-3xl border border-destructive/20 bg-card px-6 py-10 text-center text-muted-foreground">
            <p>Featured inventory could not be loaded from the public API.</p>
            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={() => bootstrapQuery.refetch()}>
                Retry featured inventory
              </Button>
            </div>
          </div>
        ) : null}

        {featuredParts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredParts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        ) : null}

        {!bootstrapQuery.isLoading && !bootstrapQuery.isError && featuredParts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center text-muted-foreground">
            Featured inventory will appear here once the public API responds.
          </div>
        ) : null}
      </section>
    </div>
  )
}
