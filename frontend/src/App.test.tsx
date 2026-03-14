import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App shell', () => {
  it('renders the phase 0 home content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          company: {
            id: 1,
            companyName: 'Hybrid Auto Parts',
            supportEmail: 'sales@hybridautoparts.local',
            phone: '(555) 010-4227',
            addressLine: '451 Salvage Row',
            city: 'Phoenix',
            state: 'Arizona',
            postalCode: '85001',
            heroHeadline: 'Recycled OEM parts with a clear digital inventory path',
            heroSubheadline: 'Seed data ready.',
            aboutText: 'Test payload',
          },
          featuredParts: [],
        }),
      }),
    )

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByText(/Phase 0 foundation/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse inventory shell/i })).toBeInTheDocument()
  })
})
