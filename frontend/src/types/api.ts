import type { components, operations } from '@shared/api-types/generated'

type OperationContent<
  T extends { responses: Record<number, unknown> },
  StatusCode extends keyof T['responses'] = 200,
> = T['responses'][StatusCode] extends { content: { '*/*': infer Content } } ? Content : never

type JsonRequestBody<T extends { requestBody?: unknown }> = T['requestBody'] extends {
  content: { 'application/json': infer Content }
}
  ? Content
  : never

export type BootstrapResponse = OperationContent<operations['bootstrap']>
export type CompanyConfig = OperationContent<operations['company']>
export type Part = OperationContent<operations['getPart_1'], 200>
export type PartPage = OperationContent<operations['listParts_1'], 200>
export type PartPageQuery = NonNullable<operations['listParts_1']['parameters']['query']>
export type PartImage = components['schemas']['PartImageDto']

export type AdminSession = OperationContent<operations['login'], 200>
export type AdminLoginRequest = JsonRequestBody<operations['login']>
export type AdminPartRequest = JsonRequestBody<operations['createPart']>
export type AdminPartStatusRequest = JsonRequestBody<operations['updateStatus']>
export type AdminPartImageOrderRequest = JsonRequestBody<operations['reorderImages']>
export type AdminCompanyConfigRequest = JsonRequestBody<operations['updateCompanyConfig']>
export type AdminPart = OperationContent<operations['getPart'], 200>
export type AdminPartPage = OperationContent<operations['listParts'], 200>
export type AdminPartPageQuery = NonNullable<operations['listParts']['parameters']['query']>
export type AdminUser = components['schemas']['AdminUserDto']
export type AdminPartImage = components['schemas']['PartImageDto']
export type AdminPartImageList = OperationContent<operations['listImages'], 200>
