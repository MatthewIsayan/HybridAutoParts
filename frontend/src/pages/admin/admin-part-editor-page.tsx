import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminPartForm } from '@/components/admin/part-form'
import { Button } from '@/components/ui/button'
import { adminQueryKeys, createAdminPart, fetchAdminPart, updateAdminPart } from '@/lib/admin-api'
import { useAdminAuth } from '@/lib/auth'
import { ApiClientError } from '@/lib/http'
import type { AdminPartRequest } from '@/types/api'

const DEFAULT_PART_FORM: AdminPartRequest = {
  sku: '',
  title: '',
  description: '',
  manufacturer: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  condition: '',
  status: 'AVAILABLE',
  locationCode: '',
  price: 0,
  featured: false,
}

interface AdminPartEditorPageProps {
  mode: 'create' | 'edit'
}

export function AdminPartEditorPage({ mode }: AdminPartEditorPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { partId = '' } = useParams()
  const { adminToken } = useAdminAuth()
  const [formValue, setFormValue] = useState<AdminPartRequest>(DEFAULT_PART_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const partQuery = useQuery({
    queryKey: adminQueryKeys.part(partId),
    queryFn: () => fetchAdminPart(adminToken ?? '', partId),
    enabled: mode === 'edit' && Boolean(adminToken) && partId.length > 0,
  })

  useEffect(() => {
    if (partQuery.data) {
      setFormValue({
        sku: partQuery.data.sku ?? '',
        title: partQuery.data.title ?? '',
        description: partQuery.data.description ?? '',
        manufacturer: partQuery.data.manufacturer ?? '',
        vehicleMake: partQuery.data.vehicleMake ?? '',
        vehicleModel: partQuery.data.vehicleModel ?? '',
        vehicleYear: partQuery.data.vehicleYear ?? '',
        condition: partQuery.data.condition ?? '',
        status: partQuery.data.status ?? 'AVAILABLE',
        locationCode: partQuery.data.locationCode ?? '',
        price: Number(partQuery.data.price ?? 0),
        featured: Boolean(partQuery.data.featured),
      })
    }
  }, [partQuery.data])

  const saveMutation = useMutation({
    mutationFn: (value: AdminPartRequest) => {
      if (mode === 'edit') {
        return updateAdminPart(adminToken ?? '', partId, value)
      }

      return createAdminPart(adminToken ?? '', value)
    },
    onSuccess: async (savedPart) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'parts'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'part'] }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.part(String(savedPart.id)) }),
      ])
      navigate('/admin/parts')
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setFieldErrors(error.fieldErrors)
        setSubmitError(error.message)
        return
      }

      setSubmitError('Part changes could not be saved.')
    },
  })

  function handleSubmit() {
    setFieldErrors({})
    setSubmitError(null)
    saveMutation.mutate(formValue)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
            {mode === 'edit' ? 'Edit part' : 'Create part'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {mode === 'edit' ? 'Update inventory details' : 'Add a new inventory record'}
          </h1>
        </div>
        <Button asChild variant="adminOutline">
          <Link to="/admin/parts">Back to inventory</Link>
        </Button>
      </div>

      {partQuery.isLoading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-10 text-slate-300">Loading part...</div>
      ) : null}

      {submitError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {submitError}
        </div>
      ) : null}

      {mode === 'create' || partQuery.data ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <AdminPartForm
            value={formValue}
            fieldErrors={fieldErrors}
            isSubmitting={saveMutation.isPending}
            submitLabel={mode === 'edit' ? 'Save changes' : 'Create part'}
            onChange={setFormValue}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </section>
  )
}
