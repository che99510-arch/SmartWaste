import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { mockBins, generateSensorReadings } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getFillColor, formatDateTime, timeAgo } from '@/lib/utils'
import { ArrowLeft, Battery, Thermometer, Clock, MapPin } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function BinDetail() {
  const { id } = useParams<{ id: string }>()
  const [bins, setBins] = useState(mockBins)
  const bin = bins.find(b => b.id === id)

  if (!bin) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-muted-foreground">Bin not found</p>
        <Button variant="outline" asChild><Link to="/bins"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link></Button>
      </div>
    </DashboardLayout>
  )

  const readings = generateSensorReadings(bin.id, bin.fill_level)
  const chartData = readings.map(r => ({
    time: format(new Date(r.recorded_at), 'HH:mm'),
    fill: r.fill_level,
    battery: r.battery_level,
  }))

  const markCollected = () => {
    setBins(prev => prev.map(b => b.id === bin.id ? { ...b, fill_level: 0, last_collected: new Date().toISOString(), status: 'active' } : b))
    toast.success('Bin marked as collected')
  }

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
          <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={markCollected}>Mark Collected</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Fill Level</p>
            <p className={`text-3xl font-bold ${getFillColor(bin.fill_level)}`}>{bin.fill_level}%</p>
            <Progress value={bin.fill_level} className="mt-2 h-2" />
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1"><Battery className="h-4 w-4" />Battery</div>
            <p className={`text-3xl font-bold ${bin.battery_level < 20 ? 'text-red-600' : 'text-green-600'}`}>{bin.battery_level}%</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1"><Thermometer className="h-4 w-4" />Temp</div>
            <p className="text-3xl font-bold">{bin.temperature?.toFixed(1) ?? '—'}°C</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1"><Clock className="h-4 w-4" />Last Collected</div>
            <p className="text-lg font-semibold">{bin.last_collected ? timeAgo(bin.last_collected) : 'Never'}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Sensor History (48h)</CardTitle></CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Waste Type', bin.waste_type],
                ['Capacity', `${bin.capacity_liters}L`],
                ['Zone', bin.zone],
                ['Coordinates', `${bin.latitude.toFixed(4)}, ${bin.longitude.toFixed(4)}`],
                ['Added', formatDateTime(bin.created_at)],
                ['Last Update', formatDateTime(bin.last_sensor_update)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium capitalize">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
