import { DashboardLayout } from '@/components/DashboardLayout'
import { mockBins, mockAlerts, mockRoutes, mockMaintenance } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function Reports() {
  const exportCSV = (data: object[], filename: string) => {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify((row as any)[k] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const stats = [
    { label: 'Total Bins',          value: mockBins.length },
    { label: 'Active',              value: mockBins.filter(b => b.status === 'active').length },
    { label: 'Critical (>85%)',     value: mockBins.filter(b => b.fill_level >= 85).length },
    { label: 'Avg Fill',            value: `${Math.round(mockBins.reduce((s,b) => s+b.fill_level,0)/mockBins.length)}%` },
    { label: 'Active Alerts',       value: mockAlerts.filter(a => !a.is_resolved).length },
    { label: 'Total Routes',        value: mockRoutes.length },
    { label: 'Completed Routes',    value: mockRoutes.filter(r => r.status === 'completed').length },
    { label: 'Maintenance Tasks',   value: mockMaintenance.length },
    { label: 'Completed Maint.',    value: mockMaintenance.filter(m => m.status === 'completed').length },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">System summary and data exports</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">System Summary — {formatDateTime(new Date())}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {stats.map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Bin Inventory',    desc: `${mockBins.length} bins`,         data: mockBins,        file: 'bins' },
            { title: 'Alert History',    desc: `${mockAlerts.length} alerts`,     data: mockAlerts,      file: 'alerts' },
            { title: 'Collection Routes',desc: `${mockRoutes.length} routes`,     data: mockRoutes,      file: 'routes' },
            { title: 'Maintenance Log',  desc: `${mockMaintenance.length} tasks`, data: mockMaintenance, file: 'maintenance' },
          ].map(({ title, desc, data, file }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{desc}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => exportCSV(data, file)}>
                  <Download className="h-3.5 w-3.5 mr-2" />Export CSV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Bin Status Report</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">{['Bin ID','Location','Zone','Fill %','Battery','Status','Waste Type'].map(h => <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>
                  {mockBins.map(b => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono">{b.bin_id}</td>
                      <td className="py-2 px-3">{b.location_name}</td>
                      <td className="py-2 px-3">{b.zone}</td>
                      <td className="py-2 px-3 font-semibold">{b.fill_level}%</td>
                      <td className="py-2 px-3">{b.battery_level}%</td>
                      <td className="py-2 px-3 capitalize">{b.status}</td>
                      <td className="py-2 px-3 capitalize">{b.waste_type}</td>
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
