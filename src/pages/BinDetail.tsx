import { useParams, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useBin, useUpdateBin } from '@/hooks/useBins'
import { useSensorData } from '@/hooks/useSensorData'
import { useMaintenance, useCreateMaintenance } from '@/hooks/useMaintenance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getFillBg, getFillColor, formatDateTime, timeAgo } from '@/lib/utils'
import { ArrowLeft, Battery, Thermometer, Droplets, MapPin, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function BinDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: bin, isLoading } = useBin(id!)
  const { data: readings = [] } = useSensorData(id!, 48)
  const { data: maintenance = [] } = useMaintenance(id)
  const updateBin = useUpdateBin()

  const chartData = readings
    .filter((_, i) => i % 3 === 0) // sample every 3rd
    .map(r => ({
      time: format(new Date(r.recorded_at), 'HH:mm'),
      fill: r.fill_level,
      battery: r.battery_level,
      temp: r.temperature?.toFixed(1),
    }))

  const markCollected = async () => {
    if (!bin) return
    try {
      await updateBin.mutateAsync({ id: bin.id, updates: { fill_level: 0, last_collected: new Date().toISOString(), status: 'active' } })
      toast.success('Bin marked as collected')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </DashboardLayout>
    )
  }

  if (!bin) return <DashboardLayout><p className="text-muted-foreground">Bin not found</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link to="/bins"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{bin.bin_id}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{bin.location_name} · {bin.zone}</p>
          </div>
          <Badge variant={bin.status === 'active' ? 'success' : bin.status === 'full' ? 'destructive' : 'warning'} className="capitalize">{bin.status}</Badge>
          <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={markCollected} disabled={updateBin.isPending}>Mark Collected</Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Fill Level</p>
              <p className={`text-3xl font-bold ${getFillColor(bin.fill_level)}`}>{bin.fill_level}%</p>
              <Progress value={bin.fill_level} className={`mt-2 h-2 [&>div]:${getFillBg(bin.fill_level)}`} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Battery className="h-4 w-4" />Battery</div>
              <p className={`text-3xl font-bold ${bin.battery_level < 20 ? 'text-red-600' : 'text-green-600'}`}>{bin.battery_level}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Thermometer className="h-4 w-4" />Temperature</div>
              <p className="text-3xl font-bold">{bin.temperature?.toFixed(1) ?? '—'}°C</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Clock className="h-4 w-4" />Last Collected</div>
              <p className="text-lg font-semibold">{bin.last_collected ? timeAgo(bin.last_collected) : 'Never'}</p>
              {bin.last_collected && <p className="text-xs text-muted-foreground">{formatDateTime(bin.last_collected)}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Sensor chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Sensor History (48h)</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No sensor data yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="fill" stroke="#16a34a" dot={false} name="Fill %" strokeWidth={2} />
                    <Line type="monotone" dataKey="battery" stroke="#2563eb" dot={false} name="Battery %" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bin info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {[
                  ['Type', bin.waste_type],
                  ['Capacity', `${bin.capacity_liters}L`],
                  ['Coordinates', `${bin.latitude.toFixed(4)}, ${bin.longitude.toFixed(4)}`],
                  ['Last Update', formatDateTime(bin.last_sensor_update)],
                  ['Added', formatDateTime(bin.created_at)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium capitalize">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Maintenance History</CardTitle></CardHeader>
            <CardContent>
              {maintenance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No maintenance records</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {maintenance.map(m => (
                    <div key={m.id} className="flex items-start gap-2 text-sm">
                      <Badge variant={m.status === 'completed' ? 'success' : m.priority === 'urgent' ? 'destructive' : 'warning'} className="capitalize text-xs shrink-0">{m.status}</Badge>
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(m.scheduled_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
