import { Link } from 'react-router-dom'

export function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Phase 2 dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Protected admin workflows are now live.</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Manage inventory records, change part status, and update the company profile that powers the public website.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Inventory manager</h2>
          <p className="mt-2 text-sm text-slate-400">Browse all parts, search by keyword, and manage availability.</p>
          <Link to="/admin/parts" className="mt-4 inline-block text-sm font-medium text-cyan-300">
            Open inventory
          </Link>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Create and edit</h2>
          <p className="mt-2 text-sm text-slate-400">Add new parts or refine existing inventory metadata without direct database access.</p>
          <Link to="/admin/parts/new" className="mt-4 inline-block text-sm font-medium text-cyan-300">
            Create a part
          </Link>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Branding settings</h2>
          <p className="mt-2 text-sm text-slate-400">Update business name, contact details, and hero copy used across public pages.</p>
          <Link to="/admin/company" className="mt-4 inline-block text-sm font-medium text-cyan-300">
            Edit company settings
          </Link>
        </article>
      </div>
    </section>
  )
}
