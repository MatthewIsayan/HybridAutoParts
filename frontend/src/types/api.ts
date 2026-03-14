import type { paths } from '@shared/api-types/generated'

export type BootstrapResponse =
  paths['/api/public/bootstrap']['get']['responses']['200']['content']['application/json']
