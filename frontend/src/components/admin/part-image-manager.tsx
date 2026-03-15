import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChangeEvent } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { adminQueryKeys, deleteAdminPartImage, fetchAdminPartImages, reorderAdminPartImages, uploadAdminPartImages } from '@/lib/admin-api'
import { useAdminAuth } from '@/lib/auth'
import { ApiClientError } from '@/lib/http'

interface PartImageManagerProps {
  partId?: string
}

export function PartImageManager({ partId }: PartImageManagerProps) {
  const queryClient = useQueryClient()
  const { adminToken } = useAdminAuth()

  const imagesQuery = useQuery({
    queryKey: adminQueryKeys.partImages(partId ?? ''),
    queryFn: () => fetchAdminPartImages(adminToken ?? '', partId ?? ''),
    enabled: Boolean(adminToken && partId),
  })

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadAdminPartImages(adminToken ?? '', partId ?? '', files),
    onSuccess: async () => {
      await invalidateImageQueries(queryClient, partId ?? '')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (imageIds: number[]) => reorderAdminPartImages(adminToken ?? '', partId ?? '', { imageIds }),
    onSuccess: async () => {
      await invalidateImageQueries(queryClient, partId ?? '')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => deleteAdminPartImage(adminToken ?? '', partId ?? '', String(imageId)),
    onSuccess: async () => {
      await invalidateImageQueries(queryClient, partId ?? '')
    },
  })

  if (!partId) {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Part images</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Save the part before uploading images</h2>
        </div>
        <p className="text-sm text-slate-300">
          Phase 3 image uploads attach to an existing part record so ordering and public gallery URLs stay stable.
        </p>
      </section>
    )
  }

  const images = imagesQuery.data ?? []
  const activeError = getMutationError(uploadMutation.error) ?? getMutationError(reorderMutation.error) ?? getMutationError(deleteMutation.error)

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    await uploadMutation.mutateAsync(files)
    event.target.value = ''
  }

  function moveImage(imageId: number, direction: -1 | 1) {
    const currentIndex = images.findIndex((image) => image.id === imageId)
    const targetIndex = currentIndex + direction
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= images.length) {
      return
    }

    const reorderedIds = images.map((image) => Number(image.id))
    ;[reorderedIds[currentIndex], reorderedIds[targetIndex]] = [reorderedIds[targetIndex], reorderedIds[currentIndex]]
    reorderMutation.mutate(reorderedIds)
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Part images</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Upload and order the gallery</h2>
          <p className="mt-2 text-sm text-slate-300">
            Upload multiple images, then move them into the display order used by the public gallery.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
          Upload images
          <input
            type="file"
            aria-label="Upload part images"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            multiple
            className="sr-only"
            onChange={handleFileSelection}
          />
        </label>
      </div>

      {activeError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{activeError}</div>
      ) : null}

      {imagesQuery.isLoading ? <p className="text-sm text-slate-400">Loading images...</p> : null}

      {images.length === 0 && !imagesQuery.isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-6 py-8 text-center text-sm text-slate-400">
          No uploaded images yet. The public site will keep using placeholder handling until images are added.
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <article key={image.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              <div className="aspect-[4/3] bg-slate-900">
                {image.url ? (
                  <img src={image.url} alt={image.altText ?? `Part image ${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">Missing image URL</div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100">Image {index + 1}</p>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                    Order {image.sortOrder}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{image.altText ?? 'Uploaded part image'}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="adminOutline"
                    onClick={() => moveImage(Number(image.id), -1)}
                    disabled={index === 0 || reorderMutation.isPending}
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    variant="adminOutline"
                    onClick={() => moveImage(Number(image.id), 1)}
                    disabled={index === images.length - 1 || reorderMutation.isPending}
                  >
                    Move down
                  </Button>
                  <Button
                    type="button"
                    variant="adminOutline"
                    onClick={() => deleteMutation.mutate(Number(image.id))}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function getMutationError(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return null
}

async function invalidateImageQueries(queryClient: QueryClient, partId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.partImages(partId) }),
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.part(partId) }),
    queryClient.invalidateQueries({ queryKey: ['public', 'part'] }),
    queryClient.invalidateQueries({ queryKey: ['public', 'inventory'] }),
    queryClient.invalidateQueries({ queryKey: ['public', 'bootstrap'] }),
  ])
}
