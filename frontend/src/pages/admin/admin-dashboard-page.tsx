export function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">Admin foundation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Protected workflows are deferred, but the route shell is ready.</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Authentication</h2>
          <p className="mt-2 text-sm text-slate-400">JWT login and guards arrive in Phase 2.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Inventory CRUD</h2>
          <p className="mt-2 text-sm text-slate-400">Forms and validation will build on the seeded `Part` model defined now.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="font-medium">Branding Settings</h2>
          <p className="mt-2 text-sm text-slate-400">Company config editing will reuse the current shared contract shape.</p>
        </article>
      </div>
    </section>
  )
}
