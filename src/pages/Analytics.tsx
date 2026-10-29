import { DashboardLayout } from '@/components/DashboardLayout'
import { useBins } from '@/hooks/useBins'
import { useAllSensorData } from '@/hooks/useSensorData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed']

export default function Analytics() {
  const { data: bins = [] } = useBins()
  const [hours, setHours] = useState(24)
  const { data: sensorData = [] } = useAllSensorData(hours)

  const zoneData = Object.entries(
    bins.reduce((acc, b) => {
      if (!acc[b.zone]) acc[b.zone] = { zone: b.zone, bins: 0, avgFill: 0 }
      acc[b.zone].bins++
      acc[b.zone].avgFill += b.fill_level
      return acc
    }, {} as Record<string, { zone: string; bins: number; avgFill: number }>)
  ).map(([_, v]) => ({ ...v, avgFill: Math.round(v.avgFill / v.bins) }))

  const typeData = Object.entries(
    bins.reduce((acc, b) => {
      acc[b.waste_type] = (acc[b.waste_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const statusData = [
    { name: 'Active', value: bins.filter(b => b.status === 'active').length },
    { name: 'Full', value: bins.filter(b => b.status === 'full').length },
    { name: 'Maintenance', value: bins.filter(b => b.status === 'maintenance').length },
    { name: 'Offline', value: bins.filter(b => b.status === 'offline').length },
  ].filter(d => d.value > 0)

  const fillRanges = [
    { range: '0-25%', count: bins.filter(b => b.fill_level <= 25).length },
    { range: '26-50%', count: bins.filter(b => b.fill_level > 25 && b.fill_level <= 50).length },
    { range: '51-75%', count: bins.filter(b => b.fill_level > 50 && b.fill_level <= 75).length },
    { range: '76-90%', count: bins.filter(b => b.fill_level > 75 && b.fill_level <= 90).length },
    { range: '91-100%', count: bins.filter(b => b.fill_level > 90).length },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm">System-wide performance insights</p>
          </div>
          <Select value={String(hours)} onValueChange={v => setHours(+v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">Last 24h</SelectItem>
              <SelectItem value="48">Last 48h</SelectItem>
              <SelectItem value="168">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avg fill by zone */}
          <Card>
            <CardHeader><CardTitle className="text-base">Avg Fill Level by Zone</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Avg Fill']} />
                    <Bar dataKey="avgFill" fill="#16a34a" radius={[4, 4, 0, 0]} name="Avg Fill %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fill distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">Fill Level Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fillRanges}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Bins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Waste type pie */}
          <Card>
            <CardHeader><CardTitle className="text-base">Bins by Waste Type</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-base">Bin Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary table */}
        <Card>
          <CardHeader><CardTitle className="text-base">Zone Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Zone</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Bins</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Avg Fill</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Critical (&gt;85%)</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneData.map(z => {
                    const critical = bins.filter(b => b.zone === z.zone && b.fill_level >= 85).length
                    return (
                      <tr key={z.zone} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{z.zone}</td>
                        <td className="py-2 px-3 text-right">{z.bins}</td>
                        <td className="py-2 px-3 text-right">{z.avgFill}%</td>
                        <td className="py-2 px-3 text-right">
                          <span className={critical > 0 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>{critical}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
