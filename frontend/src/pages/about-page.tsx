import { useQuery } from '@tanstack/react-query'
import { fetchCompanyConfig, publicQueryKeys } from '@/lib/public-api'

export function AboutPage() {
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: fetchCompanyConfig,
  })

  const company = companyQuery.data

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">About the yard</p>
        <h1 className="text-3xl font-semibold tracking-tight">{company?.companyName ?? 'About Hybrid Auto Parts'}</h1>
        <p className="max-w-3xl text-muted-foreground">
          {company?.aboutText ??
            'Company details load from the public configuration endpoint so public pages and future admin editing share the same source of truth.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-primary">Location</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {company
              ? `${company.addressLine}, ${company.city}, ${company.state} ${company.postalCode}`
              : 'Loading business address...'}
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-primary">Contact</p>
          <p className="mt-3 text-sm text-muted-foreground">{company?.phone ?? 'Loading business phone...'}</p>
          <p className="text-sm text-muted-foreground">{company?.supportEmail ?? 'Loading support email...'}</p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-primary">Inventory focus</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Reusable OEM parts with a simple searchable catalog built first, while richer image handling and advanced
            search stay deferred to later phases.
          </p>
        </article>
      </div>
    </section>
  )
}
