const inventoryRoadmap = [
  'Paginated inventory listing',
  'Keyword search over seeded part fields',
  'Card grid built from generated API types',
]

export function InventoryPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Public inventory</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Inventory route is reserved for Phase 1.</h1>
      </div>
      <p className="max-w-2xl text-muted-foreground">
        The route already exists so navigation, layout, and future query boundaries can stabilize before full browsing ships.
      </p>
      <ul className="grid gap-3 md:grid-cols-3">
        {inventoryRoadmap.map((item) => (
          <li key={item} className="rounded-2xl border border-border bg-card p-4">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
