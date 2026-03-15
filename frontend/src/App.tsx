import { Route, Routes } from 'react-router-dom'
import { RequireAdminAuth } from '@/components/admin/require-admin-auth'
import { AdminShell } from '@/components/layout/admin-shell'
import { PublicShell } from '@/components/layout/public-shell'
import { AdminAuthProvider } from '@/lib/auth'
import { AboutPage } from '@/pages/about-page'
import { ContactPage } from '@/pages/contact-page'
import { HomePage } from '@/pages/home-page'
import { InventoryPage } from '@/pages/inventory-page'
import { PartDetailPage } from '@/pages/part-detail-page'
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { AdminLoginPage } from '@/pages/admin/admin-login-page'
import { AdminCompanyPage } from '@/pages/admin/admin-company-page'
import { AdminPartEditorPage } from '@/pages/admin/admin-part-editor-page'
import { AdminPartsPage } from '@/pages/admin/admin-parts-page'

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route element={<PublicShell />}>
          <Route index element={<HomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:partId" element={<PartDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdminAuth />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="parts" element={<AdminPartsPage />} />
            <Route path="parts/new" element={<AdminPartEditorPage mode="create" />} />
            <Route path="parts/:partId/edit" element={<AdminPartEditorPage mode="edit" />} />
            <Route path="company" element={<AdminCompanyPage />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
  )
}
