import { DashboardLayout } from '@/components/DashboardLayout'
import { useBins } from '@/hooks/useBins'
import { useAlerts } from '@/hooks/useAlerts'
import { useRoutes } from '@/hooks/useRoutes'
import { useMaintenance } from '@/hooks/useMaintenance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function Reports() {
  const { data: bins = [] } = useBins()
  const { data: alerts = [] } = useAlerts()
  const { data: routes = [] } = useRoutes()
  const { data: maintenance = [] } = useMaintenance()

  const exportCSV = (data: object[], filename: string) => {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify((row as any)[k] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const summaryStats = [
    { label: 'Total Bins', value: bins.length },
    { label: 'Active', value: bins.filter(b => b.status === 'active').length },
    { label: 'Full / Critical', value: bins.filter(b => b.fill_level >= 85).length },
    { label: 'Avg Fill Level', value: `${bins.length ? Math.round(bins.reduce((s,b) => s + b.fill_level, 0) / bins.length) : 0}%` },
    { label: 'Total Alerts', value: (alerts as any[]).length },
    { label: 'Unresolved Alerts', value: (alerts as any[]).filter((a: any) => !a.is_resolved).length },
    { label: 'Total Routes', value: routes.length },
    { label: 'Completed Routes', value: routes.filter(r => r.status === 'completed').length },
    { label: 'Maintenance Tasks', value: maintenance.length },
    { label: 'Completed Maintenance', value: maintenance.filter(m => m.status === 'completed').length },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">System summary and data exports</p>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader><CardTitle className="text-base">System Summary — {formatDateTime(new Date())}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {summaryStats.map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Bin Inventory', description: `${bins.length} bins with status and metrics`, data: bins, file: 'bins' },
            { title: 'Alert History', description: `${(alerts as any[]).length} alerts total`, data: alerts, file: 'alerts' },
            { title: 'Collection Routes', description: `${routes.length} routes`, data: routes, file: 'routes' },
            { title: 'Maintenance Log', description: `${maintenance.length} tasks`, data: maintenance, file: 'maintenance' },
          ].map(({ title, description, data, file }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => exportCSV(data as any[], file)}>
                  <Download className="h-3.5 w-3.5 mr-2" />Export CSV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bins table preview */}
        <Card>
          <CardHeader><CardTitle className="text-base">Bin Status Report</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {['Bin ID','Location','Zone','Fill %','Battery','Status','Last Collected'].map(h => (
                      <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bins.map(b => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono">{b.bin_id}</td>
                      <td className="py-2 px-3">{b.location_name}</td>
                      <td className="py-2 px-3">{b.zone}</td>
                      <td className="py-2 px-3 font-semibold">{b.fill_level}%</td>
                      <td className="py-2 px-3">{b.battery_level}%</td>
                      <td className="py-2 px-3 capitalize">{b.status}</td>
                      <td className="py-2 px-3 text-muted-foreground">{b.last_collected ? formatDateTime(b.last_collected) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
