import type { components, operations } from '@shared/api-types/generated'

type OperationContent<T extends { responses: { 200: { content: { '*/*': unknown } } } }> = T['responses'][200]['content']['*/*']

export type BootstrapResponse = OperationContent<operations['bootstrap']>
export type CompanyConfig = OperationContent<operations['company']>
export type Part = OperationContent<operations['getPart']>
export type PartPage = OperationContent<operations['listParts']>
export type PartPageQuery = NonNullable<operations['listParts']['parameters']['query']>
export type PartImage = components['schemas']['PartImageDto']
