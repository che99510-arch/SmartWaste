import { DashboardLayout } from '@/components/DashboardLayout'
import { useBins } from '@/hooks/useBins'
import { useAlerts } from '@/hooks/useAlerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getFillBg, getFillColor, timeAgo } from '@/lib/utils'
import { Trash2, AlertTriangle, CheckCircle, Battery, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useSensorData } from '@/hooks/useSensorData'

function StatsCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: bins = [], isLoading } = useBins()
  const { data: alerts = [] } = useAlerts(false)

  const totalBins = bins.length
  const fullBins = bins.filter(b => b.fill_level >= 85).length
  const activeBins = bins.filter(b => b.status === 'active').length
  const avgFill = bins.length ? Math.round(bins.reduce((s, b) => s + b.fill_level, 0) / bins.length) : 0
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length

  // Use first bin for chart demo
  const firstBin = bins[0]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Real-time waste monitoring — Bamenda</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Bins" value={totalBins} sub={`${activeBins} active`} icon={Trash2} color="bg-blue-100 text-blue-600" />
          <StatsCard title="Avg Fill Level" value={`${avgFill}%`} sub={`${fullBins} bins need collection`} icon={Activity} color="bg-green-100 text-green-600" />
          <StatsCard title="Active Alerts" value={alerts.length} sub={`${criticalAlerts} critical`} icon={AlertTriangle} color="bg-red-100 text-red-600" />
          <StatsCard title="Operational" value={`${activeBins}/${totalBins}`} sub="bins online" icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bin status list */}
          <Card>
            <CardHeader><CardTitle className="text-base">Bin Status Overview</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {bins.map(bin => (
                    <div key={bin.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{bin.bin_id}</span>
                          <span className={`text-xs font-semibold ${getFillColor(bin.fill_level)}`}>{bin.fill_level}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">{bin.location_name}</p>
                        <Progress value={bin.fill_level} className={`h-1.5 [&>div]:${getFillBg(bin.fill_level)}`} />
                      </div>
                      <Badge variant={bin.status === 'active' ? 'success' : bin.status === 'full' ? 'destructive' : 'warning'} className="shrink-0 capitalize text-xs">
                        {bin.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active alerts */}
          <Card>
            <CardHeader><CardTitle className="text-base">Active Alerts</CardTitle></CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                  <p className="text-sm">All clear — no active alerts</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {alerts.slice(0, 10).map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(alert.created_at)}</p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'} className="capitalize shrink-0 text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fill level distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Fill Level Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bins.map(b => ({ name: b.bin_id, fill: b.fill_level, battery: b.battery_level }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
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
