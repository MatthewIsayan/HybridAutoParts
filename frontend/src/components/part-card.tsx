import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Part } from '@/types/api'

function formatVehicleLabel(part: Part) {
  return [part.vehicleYear, part.vehicleMake, part.vehicleModel].filter(Boolean).join(' ')
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

interface PartCardProps {
  part: Part
}

export function PartCard({ part }: PartCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const primaryImage = part.images?.[0]
  const vehicleLabel = useMemo(() => formatVehicleLabel(part), [part])
  const imageLabel = primaryImage?.altText ?? `${part.title} placeholder`

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="aspect-[4/3] border-b border-border bg-muted">
        {primaryImage?.url && !imageFailed ? (
          <img
            src={primaryImage.url}
            alt={imageLabel}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-slate-200 px-6 text-center text-sm text-muted-foreground">
            {imageLabel}
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{part.sku}</p>
          <h2 className="text-lg font-semibold leading-tight">{part.title}</h2>
          <p className="text-sm text-muted-foreground">
            {vehicleLabel || 'Vehicle details available on the part page'}
            {part.condition ? ` · ${part.condition}` : ''}
          </p>
        </div>

        {part.description ? <p className="text-sm text-muted-foreground">{part.description}</p> : null}

        <div className="flex items-center justify-between gap-4">
          <p className="text-base font-semibold">{formatPrice(part.price ?? 0)}</p>
          <Link
            to={`/inventory/${part.id}`}
            className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  )
}
