/**
 * Placeholder OpenAPI output for Phase 0.
 * Regenerate with `npm run generate:api-types` from the repo root after the backend is running.
 */

export interface components {
  schemas: {
    BootstrapResponseDto: {
      company: components['schemas']['CompanyConfigDto']
      featuredParts: components['schemas']['PartDto'][]
    }
    CompanyConfigDto: {
      id: number
      companyName: string
      supportEmail: string
      phone: string
      addressLine: string
      city: string
      state: string
      postalCode: string
      heroHeadline: string
      heroSubheadline: string
      aboutText: string | null
    }
    HealthResponse: {
      status: string
      service: string
      timestamp: string
    }
    PartDto: {
      id: number
      sku: string
      title: string
      description: string | null
      manufacturer: string | null
      vehicleMake: string | null
      vehicleModel: string | null
      vehicleYear: string | null
      condition: string | null
      status: string | null
      locationCode: string | null
      price: number
      featured: boolean
      images: components['schemas']['PartImageDto'][]
    }
    PartImageDto: {
      id: number
      url: string
      altText: string | null
      sortOrder: number
      placeholder: boolean
    }
  }
}

export interface paths {
  '/api/health': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['HealthResponse']
          }
        }
      }
    }
  }
  '/api/public/bootstrap': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['BootstrapResponseDto']
          }
        }
      }
    }
  }
}
