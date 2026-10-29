import { DashboardLayout } from '@/components/DashboardLayout'
import { mockBins, mockAlerts } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getFillColor, timeAgo } from '@/lib/utils'
import { Trash2, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const bins = mockBins
  const alerts = mockAlerts.filter(a => !a.is_resolved)

  const totalBins = bins.length
  const activeBins = bins.filter(b => b.status === 'active').length
  const avgFill = Math.round(bins.reduce((s, b) => s + b.fill_level, 0) / bins.length)
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time waste monitoring — Bamenda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total Bins',    value: totalBins,          sub: `${activeBins} active`,             icon: Trash2,        color: 'bg-blue-100 text-blue-600' },
            { title: 'Avg Fill',      value: `${avgFill}%`,      sub: `${bins.filter(b=>b.fill_level>=85).length} need collection`, icon: Activity, color: 'bg-green-100 text-green-600' },
            { title: 'Active Alerts', value: alerts.length,      sub: `${criticalAlerts} critical`,       icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
            { title: 'Operational',   value: `${activeBins}/${totalBins}`, sub: 'bins online',            icon: CheckCircle,   color: 'bg-emerald-100 text-emerald-600' },
          ].map(({ title, value, sub, icon: Icon, color }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Bin Status Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {bins.map(bin => (
                  <div key={bin.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{bin.bin_id}</span>
                        <span className={`text-xs font-semibold ${getFillColor(bin.fill_level)}`}>{bin.fill_level}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">{bin.location_name}</p>
                      <Progress value={bin.fill_level} className="h-1.5" />
                    </div>
                    <Badge variant={bin.status === 'active' ? 'success' : bin.status === 'full' ? 'destructive' : 'warning'} className="capitalize text-xs shrink-0">
                      {bin.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Active Alerts</CardTitle></CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                  <p className="text-sm">All clear</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {alerts.slice(0, 8).map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(alert.created_at)}</p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'} className="capitalize shrink-0 text-xs">{alert.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Fill Level by Bin</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bins.map(b => ({ name: b.bin_id, fill: b.fill_level }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Fill Level']} />
                  <Area type="monotone" dataKey="fill" stroke="#16a34a" fill="#bbf7d0" name="Fill %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
