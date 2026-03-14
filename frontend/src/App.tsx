import { Route, Routes } from 'react-router-dom'
import { AdminShell } from '@/components/layout/admin-shell'
import { PublicShell } from '@/components/layout/public-shell'
import { AboutPage } from '@/pages/about-page'
import { ContactPage } from '@/pages/contact-page'
import { HomePage } from '@/pages/home-page'
import { InventoryPage } from '@/pages/inventory-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route index element={<HomePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  )
}
