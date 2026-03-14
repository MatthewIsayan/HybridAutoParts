import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { fetchCompanyConfig, publicQueryKeys } from '@/lib/public-api'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function PublicShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: fetchCompanyConfig,
  })

  const companyName = companyQuery.data?.companyName ?? 'Hybrid Auto Parts'
  const phone = companyQuery.data?.phone
  const supportEmail = companyQuery.data?.supportEmail
  const address = companyQuery.data
    ? `${companyQuery.data.addressLine}, ${companyQuery.data.city}, ${companyQuery.data.state} ${companyQuery.data.postalCode}`
    : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-lg font-semibold tracking-tight" onClick={() => setMobileNavOpen(false)}>
              {companyName}
            </Link>
            <div className="hidden items-center gap-4 md:flex">
              <nav className="flex gap-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'text-sm text-muted-foreground transition-colors hover:text-foreground',
                        isActive && 'text-foreground',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <Button asChild variant="outline">
                <Link to="/admin">Admin</Link>
              </Button>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div
            id="mobile-navigation"
            className={cn('mt-4 space-y-3 md:hidden', mobileNavOpen ? 'block' : 'hidden')}
          >
            <nav className="grid gap-2 rounded-2xl border border-border bg-background p-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      isActive && 'bg-muted text-foreground',
                    )
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin" onClick={() => setMobileNavOpen(false)}>
                Admin
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <p className="font-medium text-foreground">{companyName}</p>
            <p className="mt-2">Seeded public company information is now powering the Phase 1 browsing experience.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Contact</p>
            <p className="mt-2">{phone ?? 'Phone available when backend data loads.'}</p>
            <p>{supportEmail ?? 'Email available when backend data loads.'}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Location</p>
            <p className="mt-2">{address ?? 'Address available when backend data loads.'}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
