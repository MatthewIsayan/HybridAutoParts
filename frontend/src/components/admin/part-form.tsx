import { Button } from '@/components/ui/button'
import type { AdminPartRequest } from '@/types/api'

interface AdminPartFormProps {
  value: AdminPartRequest
  fieldErrors?: Record<string, string>
  isSubmitting?: boolean
  submitLabel: string
  onChange: (value: AdminPartRequest) => void
  onSubmit: () => void
}

export function AdminPartForm({
  value,
  fieldErrors = {},
  isSubmitting = false,
  submitLabel,
  onChange,
  onSubmit,
}: AdminPartFormProps) {
  function updateField<K extends keyof AdminPartRequest>(field: K, nextValue: AdminPartRequest[K]) {
    onChange({
      ...value,
      [field]: nextValue,
    })
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="SKU"
          value={value.sku}
          error={fieldErrors.sku}
          onChange={(nextValue) => updateField('sku', nextValue)}
        />
        <FormField
          label="Title"
          value={value.title}
          error={fieldErrors.title}
          onChange={(nextValue) => updateField('title', nextValue)}
        />
        <FormField
          label="Manufacturer"
          value={value.manufacturer ?? ''}
          error={fieldErrors.manufacturer}
          onChange={(nextValue) => updateField('manufacturer', nextValue)}
        />
        <FormField
          label="Vehicle make"
          value={value.vehicleMake ?? ''}
          error={fieldErrors.vehicleMake}
          onChange={(nextValue) => updateField('vehicleMake', nextValue)}
        />
        <FormField
          label="Vehicle model"
          value={value.vehicleModel ?? ''}
          error={fieldErrors.vehicleModel}
          onChange={(nextValue) => updateField('vehicleModel', nextValue)}
        />
        <FormField
          label="Vehicle year"
          value={value.vehicleYear ?? ''}
          error={fieldErrors.vehicleYear}
          onChange={(nextValue) => updateField('vehicleYear', nextValue)}
        />
        <FormField
          label="Condition"
          value={value.condition}
          error={fieldErrors.condition}
          onChange={(nextValue) => updateField('condition', nextValue)}
        />
        <SelectField
          label="Status"
          value={value.status}
          error={fieldErrors.status}
          options={[
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'HOLD', label: 'Hold' },
            { value: 'SOLD', label: 'Sold' },
          ]}
          onChange={(nextValue) => updateField('status', nextValue)}
        />
        <FormField
          label="Location code"
          value={value.locationCode}
          error={fieldErrors.locationCode}
          onChange={(nextValue) => updateField('locationCode', nextValue)}
        />
        <FormField
          label="Price"
          type="number"
          step="0.01"
          value={String(value.price ?? '')}
          error={fieldErrors.price}
          onChange={(nextValue) => updateField('price', Number(nextValue))}
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={value.featured ?? false}
          onChange={(event) => updateField('featured', event.target.checked)}
        />
        Mark as featured inventory
      </label>

      <TextAreaField
        label="Description"
        value={value.description ?? ''}
        error={fieldErrors.description}
        onChange={(nextValue) => updateField('description', nextValue)}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

interface BaseFieldProps {
  label: string
  error?: string
}

interface FormFieldProps extends BaseFieldProps {
  value: string
  type?: string
  step?: string
  onChange: (value: string) => void
}

function FormField({ label, value, error, type = 'text', step, onChange }: FormFieldProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
      />
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </label>
  )
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
}

function TextAreaField({ label, value, error, onChange }: TextAreaFieldProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
      />
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </label>
  )
}

interface SelectFieldProps extends BaseFieldProps {
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

function SelectField({ label, value, error, options, onChange }: SelectFieldProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </label>
  )
}
