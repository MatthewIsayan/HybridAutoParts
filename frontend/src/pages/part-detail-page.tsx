import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { resolveMediaUrl } from '@/lib/app-config'
import { fetchCompanyConfig, fetchPart, publicQueryKeys } from '@/lib/public-api'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export function PartDetailPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, true>>({})
  const { partId = '' } = useParams()
  const partQuery = useQuery({
    queryKey: publicQueryKeys.part(partId),
    queryFn: () => fetchPart(partId),
    enabled: partId.length > 0,
  })
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: fetchCompanyConfig,
  })

  const part = partQuery.data
  const company = companyQuery.data
  const images = part?.images ?? []
  const primaryImage = images[selectedImageIndex] ?? images[0]
  const primaryImageUrl = resolveMediaUrl(primaryImage?.url)

  if (partQuery.isLoading) {
    return (
      <section className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Part detail</p>
        <div className="rounded-3xl border border-border bg-card px-6 py-10 text-muted-foreground">Loading part details...</div>
      </section>
    )
  }

  if (partQuery.isError) {
    return (
      <section className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Part detail</p>
        <h1 className="text-3xl font-semibold tracking-tight">Part not found</h1>
        <p className="max-w-3xl text-muted-foreground">
          The requested part is not available in the public inventory right now.
        </p>
        <Button asChild variant="outline">
          <Link to="/inventory">Back to inventory</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Link to="/inventory" className="transition-opacity hover:opacity-80">
          Inventory
        </Link>
        <span>/</span>
        <span>{part?.sku ?? 'Loading part...'}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="aspect-[4/3] bg-muted">
            {primaryImageUrl && !failedImageUrls[primaryImageUrl] ? (
              <img
                src={primaryImageUrl}
                alt={primaryImage.altText ?? part?.title ?? 'Part image'}
                className="h-full w-full object-cover"
                onError={() => {
                  setFailedImageUrls((currentValue) => ({
                    ...currentValue,
                    [primaryImageUrl]: true,
                  }))
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                {primaryImage?.altText ?? 'Placeholder image for this part'}
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3 border-t border-border p-4 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  key={image.id ?? `${image.url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-2xl border ${index === selectedImageIndex ? 'border-primary' : 'border-border'} bg-muted transition hover:opacity-90`}
                >
                  {resolveMediaUrl(image.url) && !failedImageUrls[resolveMediaUrl(image.url)] ? (
                    <img
                      src={resolveMediaUrl(image.url)}
                      alt={image.altText ?? `Part image ${index + 1}`}
                      className="aspect-square h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center px-2 text-center text-xs text-muted-foreground">
                      {index + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{part?.sku ?? 'Loading SKU...'}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{part?.title ?? 'Loading part details...'}</h1>
            <p className="text-lg font-semibold">{part ? formatPrice(part.price ?? 0) : 'Loading price...'}</p>
          </div>

          <p className="text-muted-foreground">
            {part?.description ?? 'Loading public part description and fitment details...'}
          </p>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/60 p-4">
              <dt className="text-sm text-muted-foreground">Vehicle</dt>
              <dd className="mt-1 font-medium">
                {[part?.vehicleYear, part?.vehicleMake, part?.vehicleModel].filter(Boolean).join(' ') || 'Pending'}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4">
              <dt className="text-sm text-muted-foreground">Condition</dt>
              <dd className="mt-1 font-medium">{part?.condition ?? 'Pending'}</dd>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4">
              <dt className="text-sm text-muted-foreground">Manufacturer</dt>
              <dd className="mt-1 font-medium">{part?.manufacturer ?? 'Pending'}</dd>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4">
              <dt className="text-sm text-muted-foreground">Location code</dt>
              <dd className="mt-1 font-medium">{part?.locationCode ?? 'Pending'}</dd>
            </div>
          </dl>

          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-medium text-primary">Contact to purchase or confirm fitment</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Call {companyQuery.isError ? 'the yard' : company?.phone ?? 'the yard'} or email{' '}
              {companyQuery.isError ? 'the support team' : company?.supportEmail ?? 'the support team'} and mention
              SKU {part?.sku ?? 'for this listing'}.
            </p>
            {companyQuery.isError ? (
              <p className="mt-3 text-sm text-muted-foreground">Company contact details are temporarily unavailable, but the part details still loaded.</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/contact">Contact the yard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/inventory">Browse more parts</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
