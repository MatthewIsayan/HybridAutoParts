import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/parts', label: 'Inventory' },
  { to: '/admin/company', label: 'Company' },
]

export function AdminShell() {
  const { session, clearSession } = useAdminAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Area</p>
            <h1 className="text-lg font-semibold">Hybrid Auto Parts Console</h1>
            <nav className="flex flex-wrap gap-3">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full border border-slate-800 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-700 hover:text-slate-50',
                      isActive && 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-400">{session?.adminUser?.displayName ?? session?.adminUser?.username}</p>
            <Button type="button" variant="adminOutline" onClick={clearSession}>
              Sign out
            </Button>
            <Button asChild variant="adminOutline">
              <Link to="/">Back to site</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
