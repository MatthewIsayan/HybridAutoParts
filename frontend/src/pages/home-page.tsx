import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { BootstrapResponse } from '@/types/api'

const fallbackPreview: BootstrapResponse = {
  company: {
    id: 1,
    companyName: 'Hybrid Auto Parts',
    supportEmail: 'sales@hybridautoparts.local',
    phone: '(555) 010-4227',
    addressLine: '451 Salvage Row',
    city: 'Phoenix',
    state: 'Arizona',
    postalCode: '85001',
    heroHeadline: 'Recycled OEM parts with a clear digital inventory path',
    heroSubheadline: 'Phase 0 shell content stays useful while the real inventory experience lands in Phase 1.',
    aboutText:
      'This placeholder data mirrors the seeded backend records so layout, routing, generated types, and API wiring can all evolve together.',
  },
  featuredParts: [
    {
      id: 1,
      sku: 'ENG-2018-CIVIC-001',
      title: '2018 Honda Civic 2.0L Engine Assembly',
      description: 'Seeded featured inventory for Phase 0.',
      manufacturer: 'Honda',
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: '2018',
      condition: 'Grade A',
      status: 'AVAILABLE',
      locationCode: 'A1-14',
      price: 1899,
      featured: true,
      images: [
        {
          id: 1,
          url: '/placeholders/engine-assembly.svg',
          altText: 'Engine placeholder',
          sortOrder: 1,
          placeholder: true,
        },
      ],
    },
  ],
}

async function fetchBootstrapPreview(): Promise<BootstrapResponse> {
  const response = await fetch('/api/public/bootstrap')

  if (!response.ok) {
    throw new Error('Bootstrap preview is not available yet.')
  }

  return (await response.json()) as BootstrapResponse
}

export function HomePage() {
  const bootstrapQuery = useQuery({
    queryKey: ['bootstrap-preview'],
    queryFn: fetchBootstrapPreview,
    placeholderData: fallbackPreview,
  })

  const company = bootstrapQuery.data?.company ?? fallbackPreview.company
  const featuredParts = bootstrapQuery.data?.featuredParts ?? fallbackPreview.featuredParts

  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-sm md:grid-cols-[1.5fr_1fr] md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Phase 0 foundation</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{company.heroHeadline}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{company.heroSubheadline}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/inventory">Browse inventory shell</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin">View admin route</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-sm font-medium text-muted-foreground">Seeded company profile</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Business</dt>
              <dd>{company.companyName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Support</dt>
              <dd>{company.supportEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{company.phone}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured seed inventory</h2>
            <p className="text-muted-foreground">
              TanStack Query is wired to the backend bootstrap endpoint and typed from generated shared OpenAPI models.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {bootstrapQuery.isError ? 'Showing fallback seed preview until the API is running.' : 'API preview connected.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredParts.map((part) => (
            <article key={part.sku} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-primary">{part.sku}</p>
              <h3 className="mt-3 text-lg font-semibold">{part.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {part.vehicleYear} {part.vehicleMake} {part.vehicleModel} · {part.condition}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{part.description}</p>
              <p className="mt-4 font-medium">${part.price.toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
