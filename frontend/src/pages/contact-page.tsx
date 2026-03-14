import { useQuery } from '@tanstack/react-query'
import { fetchCompanyConfig, publicQueryKeys } from '@/lib/public-api'

export function ContactPage() {
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: fetchCompanyConfig,
  })

  const company = companyQuery.data

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Contact</p>
        <h1 className="text-3xl font-semibold tracking-tight">Reach the yard directly</h1>
        <p className="max-w-3xl text-muted-foreground">
          Public contact information is pulled from the shared company configuration so the website and future admin
          settings stay aligned.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Business details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{company?.phone ?? 'Loading business phone...'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{company?.supportEmail ?? 'Loading support email...'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd>
                {company
                  ? `${company.addressLine}, ${company.city}, ${company.state} ${company.postalCode}`
                  : 'Loading business address...'}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Map placeholder</h2>
          <div className="mt-5 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/60 px-6 text-center text-sm text-muted-foreground">
            Map embed placeholder for {company?.companyName ?? 'the business location'}.
            <br />
            A richer interactive map can be layered in without changing the public page structure.
          </div>
        </article>
      </div>
    </section>
  )
}
