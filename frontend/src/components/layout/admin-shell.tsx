import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AdminShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Area</p>
            <h1 className="text-lg font-semibold">Hybrid Auto Parts Console</h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to site</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
