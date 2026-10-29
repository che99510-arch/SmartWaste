import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

import Dashboard from '@/pages/Dashboard'
import BinManagement from '@/pages/BinManagement'
import BinDetail from '@/pages/BinDetail'
import Analytics from '@/pages/Analytics'
import Alerts from '@/pages/Alerts'
import RouteOptimization from '@/pages/RouteOptimization'
import Maintenance from '@/pages/Maintenance'
import Reports from '@/pages/Reports'
import UserManagement from '@/pages/UserManagement'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bins" element={<BinManagement />} />
        <Route path="/bins/:id" element={<BinDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/routes" element={<RouteOptimization />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
