import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { mockAlerts } from '@/data/mockData'
import {
  LayoutDashboard, Trash2, BarChart3, Route, Wrench,
  FileText, Users, Settings, Menu, X, Bell, Recycle, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/',            label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/bins',        label: 'Bin Management',  icon: Trash2 },
  { to: '/analytics',   label: 'Analytics',       icon: BarChart3 },
  { to: '/routes',      label: 'Route Optimization', icon: Route },
  { to: '/maintenance', label: 'Maintenance',     icon: Wrench },
  { to: '/alerts',      label: 'Alerts',          icon: AlertTriangle },
  { to: '/reports',     label: 'Reports',         icon: FileText },
  { to: '/users',       label: 'User Management', icon: Users },
  { to: '/settings',    label: 'Settings',        icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const unresolved = mockAlerts.filter(a => !a.is_resolved).length

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2 px-4 py-4 border-b">
          <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Recycle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">SmartWaste</p>
            <p className="text-xs text-muted-foreground">Bamenda Monitor</p>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                location.pathname === to
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs">E</div>
            <div>
              <p className="text-sm font-medium">Emmanuel Fru</p>
              <p className="text-xs text-muted-foreground">Admin · Demo Mode</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Link to="/alerts" className="relative">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              {unresolved > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unresolved > 9 ? '9+' : unresolved}
                </span>
              )}
            </Button>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
