import { render, screen, waitFor } from '@testing-library/react'
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

const galleryPart = {
  ...hondaEngine,
  images: [
    {
      id: 11,
      url: '/uploads/part-images/1/front-view.png',
      altText: 'Front view',
      sortOrder: 1,
      placeholder: false,
    },
    {
      id: 12,
      url: '/uploads/part-images/1/side-view.png',
      altText: 'Side view',
      sortOrder: 2,
      placeholder: false,
    },
  ],
}

const adminSession = {
  tokenType: 'Bearer',
  accessToken: 'phase-2-test-token',
  expiresAt: '2099-01-01T00:00:00Z',
  adminUser: {
    id: 1,
    username: 'admin',
    email: 'admin@hybridautoparts.local',
    displayName: 'Local Admin',
    role: 'ADMIN',
    active: true,
  },
}

type TestScenario = {
  bootstrapFails?: boolean
  publicInventoryFails?: boolean
  adminCompanyFails?: boolean
  adminCompanyUnauthorized?: boolean
  adminImagesFail?: boolean
}

let scenario: TestScenario

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => body,
  })
}

function emptyResponse(status = 204) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 204 ? 'No Content' : 'Error',
    headers: {
      get: () => null,
    },
  })
}

function renderApp(initialEntry = '/', queryClient = createQueryClient()) {
  window.history.pushState({}, 'Test', initialEntry)

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return queryClient
}

describe('Phase 2 admin and public flows', () => {
  beforeEach(() => {
    window.localStorage.clear()
    scenario = {}
    let currentAdminImages = [...galleryPart.images]

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? 'GET'

        if (url.includes('/api/public/company')) {
          return jsonResponse(company)
        }

        if (url.includes('/api/public/bootstrap')) {
          if (scenario.bootstrapFails) {
            return jsonResponse({ message: 'Bootstrap failed.' }, 500)
          }

          return jsonResponse({
            company,
            featuredParts: [galleryPart, camryTransmission],
          })
        }

        if (url.includes('/api/public/parts/1')) {
          return jsonResponse({
            ...galleryPart,
            images: currentAdminImages,
          })
        }

        if (url.includes('/api/public/parts?page=0&size=12')) {
          if (scenario.publicInventoryFails) {
            return jsonResponse({ message: 'Inventory failed.' }, 500)
          }

          return jsonResponse({
            content: [{ ...galleryPart, images: currentAdminImages }, camryTransmission],
            page: 0,
            size: 12,
            totalElements: 2,
            totalPages: 1,
            first: true,
            last: true,
            empty: false,
          })
        }

        if (url.includes('/api/admin/auth/login') && method === 'POST') {
          return jsonResponse(adminSession)
        }

        if (url.includes('/api/admin/parts?page=0&size=20') && method === 'GET') {
          return jsonResponse({
            content: [{ ...galleryPart, images: currentAdminImages }],
            page: 0,
            size: 20,
            totalElements: 1,
            totalPages: 1,
            first: true,
            last: true,
            empty: false,
          })
        }

        if (url.includes('/api/admin/company') && method === 'GET') {
          if (scenario.adminCompanyUnauthorized) {
            return jsonResponse({ message: 'Unauthorized' }, 401)
          }

          if (scenario.adminCompanyFails) {
            return jsonResponse({ message: 'Company load failed.' }, 500)
          }

          return jsonResponse(company)
        }

        if (url.includes('/api/admin/company') && method === 'PUT') {
          return jsonResponse({
            ...company,
            companyName: 'Hybrid Auto Parts Updated',
          })
        }

        if (url.includes('/api/admin/parts/1/images') && method === 'GET') {
          if (scenario.adminImagesFail) {
            return jsonResponse({ message: 'Images failed.' }, 500)
          }

          return jsonResponse(currentAdminImages)
        }

        if (url.includes('/api/admin/parts/1/images') && method === 'POST') {
          const formData = init?.body as FormData
          const files = formData?.getAll('files') ?? []
          const nextImages = files.map((file, index) => ({
            id: currentAdminImages.length + index + 100,
            url: `/uploads/part-images/1/${(file as File).name}`,
            altText: (file as File).name,
            sortOrder: currentAdminImages.length + index + 1,
            placeholder: false,
          }))
          currentAdminImages = [...currentAdminImages, ...nextImages]
          return jsonResponse({
            ...galleryPart,
            images: currentAdminImages,
          })
        }

        if (url.includes('/api/admin/parts/1') && method === 'GET') {
          return jsonResponse({
            ...galleryPart,
            images: currentAdminImages,
          })
        }

        if (url.includes('/api/admin/parts') && method === 'POST') {
          return jsonResponse(
            {
              ...galleryPart,
              id: 99,
              sku: 'NEW-PART-001',
              title: 'Created Test Part',
            },
            201,
          )
        }

        if (url.includes('/api/admin/parts/1/images/order') && method === 'PATCH') {
          const body = JSON.parse(String(init?.body ?? '{}')) as { imageIds: number[] }
          currentAdminImages = body.imageIds
            .map((imageId) => currentAdminImages.find((image) => image.id === imageId))
            .filter((image): image is NonNullable<typeof image> => Boolean(image))
            .map((image, index) => ({
              ...image,
              sortOrder: index + 1,
            }))
          return jsonResponse({
            ...galleryPart,
            images: currentAdminImages,
          })
        }

        if (method === 'DELETE') {
          if (url.includes('/api/admin/parts/1/images/')) {
            const imageId = Number(url.split('/').pop())
            currentAdminImages = currentAdminImages
              .filter((image) => image.id !== imageId)
              .map((image, index) => ({
                ...image,
                sortOrder: index + 1,
              }))
            return jsonResponse({
              ...galleryPart,
              images: currentAdminImages,
            })
          }

          return emptyResponse()
        }

        return jsonResponse({ message: `Unhandled request for ${method} ${url}` }, 500)
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('renders the public home page with featured inventory', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { name: /recycled oem parts with a clear digital inventory path/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search inventory/i })).toBeInTheDocument()
    expect(await screen.findByText(/2018 Honda Civic 2\.0L Engine Assembly/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2019 camry camera/i })).toBeInTheDocument()
  })

  it('shows fallback messaging when bootstrap loading fails', async () => {
    scenario.bootstrapFails = true
    renderApp('/')

    expect(await screen.findByText(/live homepage data could not be loaded/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry featured inventory/i })).toBeInTheDocument()
  })

  it('redirects unauthenticated admin routes to the login page', async () => {
    renderApp('/admin')

    expect(await screen.findByRole('heading', { name: /sign in to manage inventory and branding/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toHaveValue('admin')
  })

  it('submits the admin login flow and lands on the dashboard', async () => {
    const user = userEvent.setup()
    renderApp('/admin')

    await user.clear(await screen.findByLabelText(/username/i))
    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.clear(screen.getByLabelText(/password/i))
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('heading', { name: /protected admin workflows are now live/i })).toBeInTheDocument()
    expect(screen.getByText(/Local Admin/i)).toBeInTheDocument()
  })

  it('submits the create part form from the protected admin area', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('hybrid-admin-session', JSON.stringify(adminSession))
    renderApp('/admin/parts/new')

    await user.type(await screen.findByLabelText(/^SKU$/i), 'NEW-PART-001')
    await user.type(screen.getByLabelText(/^Title$/i), 'Created Test Part')
    await user.type(screen.getByLabelText(/^Condition$/i), 'A grade')
    await user.type(screen.getByLabelText(/location code/i), 'A1-01')
    await user.clear(screen.getByLabelText(/^Price$/i))
    await user.type(screen.getByLabelText(/^Price$/i), '123.45')
    await user.click(screen.getByRole('button', { name: /create part/i }))

    expect(await screen.findByRole('heading', { name: /manage all parts/i })).toBeInTheDocument()

    const fetchMock = vi.mocked(fetch)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/parts',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })

  it('renders the public part gallery with multiple ordered images', async () => {
    const user = userEvent.setup()
    renderApp('/inventory/1')

    expect(await screen.findByRole('heading', { name: /2018 Honda Civic 2\.0L Engine Assembly/i })).toBeInTheDocument()
    expect(screen.getAllByAltText(/front view/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /side view/i }))

    expect(screen.getAllByAltText(/side view/i).length).toBeGreaterThan(0)
  })

  it('manages uploaded images from the admin part editor', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('hybrid-admin-session', JSON.stringify(adminSession))
    renderApp('/admin/parts/1/edit')

    expect(await screen.findByRole('heading', { name: /update inventory details/i })).toBeInTheDocument()
    expect(await screen.findByText(/upload and order the gallery/i)).toBeInTheDocument()

    const fileInput = screen.getByLabelText(/upload part images/i)
    await user.upload(fileInput, [new File(['binary'], 'rear-view.png', { type: 'image/png' })])

    await waitFor(() => {
      expect(screen.getByText(/rear-view\.png/i)).toBeInTheDocument()
    })
  })

  it('shows active search state and clears it on the inventory page', async () => {
    const user = userEvent.setup()
    renderApp('/inventory?search=camry')

    expect(await screen.findByText(/active search:/i)).toBeInTheDocument()
    expect(screen.getByText(/^camry$/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear search/i }))

    await waitFor(() => {
      expect(screen.queryByText(/^camry$/i)).not.toBeInTheDocument()
    })
  })

  it('shows a retry state when public inventory loading fails', async () => {
    scenario.publicInventoryFails = true
    renderApp('/inventory')

    expect(await screen.findByText(/inventory data could not be loaded right now/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry inventory/i })).toBeInTheDocument()
  })

  it('submits the company settings form and shows success feedback', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('hybrid-admin-session', JSON.stringify(adminSession))
    renderApp('/admin/company')

    await user.clear(await screen.findByLabelText(/company name/i))
    await user.type(screen.getByLabelText(/company name/i), 'Hybrid Auto Parts Updated')
    await user.click(screen.getByRole('button', { name: /save company settings/i }))

    expect(await screen.findByText(/company settings saved/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/admin/company',
        expect.objectContaining({
          method: 'PUT',
        }),
      )
    })
  })

  it('shows a retry panel when admin company settings fail to load', async () => {
    scenario.adminCompanyFails = true
    window.localStorage.setItem('hybrid-admin-session', JSON.stringify(adminSession))
    renderApp('/admin/company')

    expect(await screen.findByText(/company settings could not be loaded right now/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry loading settings/i })).toBeInTheDocument()
  })

  it('returns to login when an admin session becomes unauthorized', async () => {
    scenario.adminCompanyUnauthorized = true
    window.localStorage.setItem('hybrid-admin-session', JSON.stringify(adminSession))
    renderApp('/admin/company')

    expect(await screen.findByRole('heading', { name: /sign in to manage inventory and branding/i })).toBeInTheDocument()
    expect(screen.getByText(/your admin session expired/i)).toBeInTheDocument()
  })

  it('shows an image retry state when the admin gallery panel fails to load', async () => {
    scenario.adminImagesFail = true
    window.localStorage.setItem('hybrid-admin-session', JSON.stringify(adminSession))
    renderApp('/admin/parts/1/edit')

    expect(await screen.findByText(/part images could not be loaded right now/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry image panel/i })).toBeInTheDocument()
  })
})
