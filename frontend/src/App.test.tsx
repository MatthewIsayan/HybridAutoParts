import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

const company = {
  id: 1,
  companyName: 'Hybrid Auto Parts',
  supportEmail: 'sales@hybridautoparts.local',
  phone: '(555) 010-4227',
  addressLine: '451 Salvage Row',
  city: 'Phoenix',
  state: 'Arizona',
  postalCode: '85001',
  heroHeadline: 'Recycled OEM parts with a clear digital inventory path',
  heroSubheadline: 'Search and browse public seed inventory.',
  aboutText: 'Hybrid Auto Parts specializes in reusable OEM inventory.',
}

const hondaEngine = {
  id: 1,
  sku: 'ENG-2018-CIVIC-001',
  title: '2018 Honda Civic 2.0L Engine Assembly',
  description: 'Low-mileage engine assembly pulled from a front-end collision donor vehicle.',
  manufacturer: 'Honda',
  vehicleMake: 'Honda',
  vehicleModel: 'Civic',
  vehicleYear: '2018',
  condition: 'Grade A',
  status: 'AVAILABLE',
  locationCode: 'A1-14',
  price: 1899,
  featured: true,
  images: [
    {
      id: 1,
      url: '/placeholders/engine-assembly.svg',
      altText: 'Engine assembly placeholder image',
      sortOrder: 1,
      placeholder: true,
    },
  ],
}

const camryTransmission = {
  id: 2,
  sku: 'TRN-2017-CAMRY-002',
  title: '2017 Toyota Camry Automatic Transmission',
  description: 'Transmission unit inspected and tagged for local phase one sample inventory.',
  manufacturer: 'Toyota',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  vehicleYear: '2017',
  condition: 'Grade A',
  status: 'AVAILABLE',
  locationCode: 'B2-03',
  price: 1249,
  featured: true,
  images: [
    {
      id: 2,
      url: '/placeholders/transmission.svg',
      altText: 'Transmission placeholder image',
      sortOrder: 1,
      placeholder: true,
    },
  ],
}

function okJson(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => body,
  })
}

function renderApp(initialEntry = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Phase 1 public browsing', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/api/public/company')) {
          return okJson(company)
        }

        if (url.includes('/api/public/bootstrap')) {
          return okJson({
            company,
            featuredParts: [hondaEngine, camryTransmission],
          })
        }

        if (url.includes('/api/public/parts?page=0&size=12&search=camry')) {
          return okJson({
            content: [camryTransmission],
            page: 0,
            size: 12,
            totalElements: 1,
            totalPages: 1,
            first: true,
            last: true,
            empty: false,
          })
        }

        if (url.includes('/api/public/parts?page=0&size=12')) {
          return okJson({
            content: [hondaEngine, camryTransmission],
            page: 0,
            size: 12,
            totalElements: 2,
            totalPages: 1,
            first: true,
            last: true,
            empty: false,
          })
        }

        if (url.includes('/api/public/parts/1')) {
          return okJson(hondaEngine)
        }

        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        })
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the public home page with featured inventory', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { name: /recycled oem parts with a clear digital inventory path/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search inventory/i })).toBeInTheDocument()
    expect(await screen.findByText(/2018 Honda Civic 2\.0L Engine Assembly/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse all inventory/i })).toBeInTheDocument()
  })

  it('renders inventory results and supports baseline search interaction', async () => {
    const user = userEvent.setup()
    renderApp('/inventory')

    expect(await screen.findByText(/2 parts found/i)).toBeInTheDocument()
    expect(screen.getByText(/2017 Toyota Camry Automatic Transmission/i)).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: /search inventory/i }))
    await user.type(screen.getByRole('searchbox', { name: /search inventory/i }), 'camry')
    await user.click(screen.getByRole('button', { name: /^search$/i }))

    expect(await screen.findByText(/1 part found for "camry"/i)).toBeInTheDocument()
    expect(screen.getByText(/2017 Toyota Camry Automatic Transmission/i)).toBeInTheDocument()
  })

  it('renders the public part detail call to action', async () => {
    renderApp('/inventory/1')

    expect(await screen.findByRole('heading', { name: /2018 Honda Civic 2\.0L Engine Assembly/i })).toBeInTheDocument()
    expect(screen.getByText(/Call \(555\) 010-4227 or email sales@hybridautoparts\.local/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact the yard/i })).toBeInTheDocument()
  })
})
