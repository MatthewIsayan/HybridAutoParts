import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { adminQueryKeys, fetchAdminCompanyConfig, updateAdminCompanyConfig } from '@/lib/admin-api'
import { useAdminAuth } from '@/lib/auth'
import { ApiClientError } from '@/lib/http'
import type { AdminCompanyConfigRequest } from '@/types/api'

const EMPTY_COMPANY_FORM: AdminCompanyConfigRequest = {
  companyName: '',
  supportEmail: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  heroHeadline: '',
  heroSubheadline: '',
  aboutText: '',
}

export function AdminCompanyPage() {
  const queryClient = useQueryClient()
  const { adminToken } = useAdminAuth()
  const [formValue, setFormValue] = useState<AdminCompanyConfigRequest>(EMPTY_COMPANY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const companyQuery = useQuery({
    queryKey: adminQueryKeys.company,
    queryFn: () => fetchAdminCompanyConfig(adminToken ?? ''),
    enabled: Boolean(adminToken),
  })

  useEffect(() => {
    if (companyQuery.data) {
      setFormValue({
        companyName: companyQuery.data.companyName ?? '',
        supportEmail: companyQuery.data.supportEmail ?? '',
        phone: companyQuery.data.phone ?? '',
        addressLine: companyQuery.data.addressLine ?? '',
        city: companyQuery.data.city ?? '',
        state: companyQuery.data.state ?? '',
        postalCode: companyQuery.data.postalCode ?? '',
        heroHeadline: companyQuery.data.heroHeadline ?? '',
        heroSubheadline: companyQuery.data.heroSubheadline ?? '',
        aboutText: companyQuery.data.aboutText ?? '',
      })
    }
  }, [companyQuery.data])

  const updateMutation = useMutation({
    mutationFn: (value: AdminCompanyConfigRequest) => updateAdminCompanyConfig(adminToken ?? '', value),
    onSuccess: async () => {
      setFieldErrors({})
      setStatusMessage('Company settings saved.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.company }),
        queryClient.invalidateQueries({ queryKey: ['public', 'company'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
      ])
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setFieldErrors(error.fieldErrors)
        setStatusMessage(error.message)
        return
      }

      setStatusMessage('Company settings could not be saved.')
    },
  })

  function updateField<K extends keyof AdminCompanyConfigRequest>(field: K, value: AdminCompanyConfigRequest[K]) {
    setFormValue((currentValue) => ({
      ...currentValue,
      [field]: value,
    }))
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Branding and contact</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Update public company details</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          These settings feed the public home, about, and contact pages through the shared company config endpoint.
        </p>
      </div>

      {statusMessage ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">{statusMessage}</div>
      ) : null}

      {companyQuery.isLoading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-10 text-slate-300">Loading company settings...</div>
      ) : null}

      {companyQuery.data ? (
        <form
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
          onSubmit={(event) => {
            event.preventDefault()
            setStatusMessage(null)
            updateMutation.mutate(formValue)
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Company name"
              value={formValue.companyName}
              error={fieldErrors.companyName}
              onChange={(value) => updateField('companyName', value)}
            />
            <FormField
              label="Support email"
              value={formValue.supportEmail}
              error={fieldErrors.supportEmail}
              onChange={(value) => updateField('supportEmail', value)}
            />
            <FormField
              label="Phone"
              value={formValue.phone}
              error={fieldErrors.phone}
              onChange={(value) => updateField('phone', value)}
            />
            <FormField
              label="Address line"
              value={formValue.addressLine}
              error={fieldErrors.addressLine}
              onChange={(value) => updateField('addressLine', value)}
            />
            <FormField label="City" value={formValue.city} error={fieldErrors.city} onChange={(value) => updateField('city', value)} />
            <FormField label="State" value={formValue.state} error={fieldErrors.state} onChange={(value) => updateField('state', value)} />
            <FormField
              label="Postal code"
              value={formValue.postalCode}
              error={fieldErrors.postalCode}
              onChange={(value) => updateField('postalCode', value)}
            />
            <FormField
              label="Hero headline"
              value={formValue.heroHeadline}
              error={fieldErrors.heroHeadline}
              onChange={(value) => updateField('heroHeadline', value)}
            />
          </div>

          <FormField
            label="Hero subheadline"
            value={formValue.heroSubheadline}
            error={fieldErrors.heroSubheadline}
            onChange={(value) => updateField('heroSubheadline', value)}
          />

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-200">About text</span>
            <textarea
              value={formValue.aboutText}
              onChange={(event) => updateField('aboutText', event.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
            {fieldErrors.aboutText ? <span className="text-sm text-rose-300">{fieldErrors.aboutText}</span> : null}
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save company settings'}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

interface FormFieldProps {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}

function FormField({ label, value, error, onChange }: FormFieldProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium text-slate-200">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-50 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
      />
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </label>
  )
}
