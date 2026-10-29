import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import Login from '@/pages/Login'
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/bins" element={<ProtectedRoute><BinManagement /></ProtectedRoute>} />
              <Route path="/bins/:id" element={<ProtectedRoute><BinDetail /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/routes" element={<ProtectedRoute><RouteOptimization /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
