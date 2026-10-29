import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { mockRoutes, mockBins } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Truck, Clock, MapPin, Trash2, Play, CheckCircle, Route } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import type { CollectionRoute } from '@/types'

const STATUS_COLOR: Record<string, any> = { pending: 'secondary', in_progress: 'warning', completed: 'success', cancelled: 'destructive' }

export default function RouteOptimization() {
  const [routes, setRoutes] = useState<CollectionRoute[]>(mockRoutes)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ name: '', driver_name: '', vehicle: '', notes: '', estimated_duration_minutes: 90, estimated_distance_km: 10 })

  const highFillBins = mockBins.filter(b => b.fill_level >= 75).sort((a, b) => b.fill_level - a.fill_level)

  const handleCreate = () => {
    if (!form.name) return toast.error('Route name is required')
    const newRoute: CollectionRoute = {
      ...form, id: Date.now().toString(), bin_ids: highFillBins.slice(0, 8).map(b => b.id),
      status: 'pending', actual_duration_minutes: null, scheduled_at: new Date().toISOString(),
      started_at: null, completed_at: null, created_by: 'u1',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    setRoutes(prev => [newRoute, ...prev])
    toast.success('Route created')
    setShowDialog(false)
    setForm({ name: '', driver_name: '', vehicle: '', notes: '', estimated_duration_minutes: 90, estimated_distance_km: 10 })
  }

  const updateStatus = (id: string, status: CollectionRoute['status']) => {
    setRoutes(prev => prev.map(r => r.id === id ? {
      ...r, status,
      started_at: status === 'in_progress' ? new Date().toISOString() : r.started_at,
      completed_at: status === 'completed' ? new Date().toISOString() : r.completed_at,
    } : r))
    toast.success(`Route marked as ${status.replace('_', ' ')}`)
  }

  const deleteRoute = (id: string) => {
    if (!confirm('Delete this route?')) return
    setRoutes(prev => prev.filter(r => r.id !== id))
    toast.success('Route deleted')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Route Optimization</h1>
            <p className="text-muted-foreground text-sm">{highFillBins.length} bins need collection</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Create Route
          </Button>
        </div>

        {highFillBins.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader><CardTitle className="text-base text-orange-800">Priority Bins — High Fill Level</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {highFillBins.map(b => (
                  <div key={b.id} className="flex items-center gap-1.5 bg-white border border-orange-200 rounded-lg px-2.5 py-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-medium">{b.bin_id}</span>
                    <span className="text-muted-foreground">{b.location_name}</span>
                    <Badge variant="destructive" className="text-xs">{b.fill_level}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {routes.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Route className="h-12 w-12" /><p>No routes yet</p>
            </CardContent></Card>
          ) : routes.map(route => (
            <Card key={route.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{route.name}</h3>
                      <Badge variant={STATUS_COLOR[route.status]} className="capitalize text-xs">{route.status.replace('_',' ')}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {route.driver_name && <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />{route.driver_name}</span>}
                      {route.vehicle && <span>{route.vehicle}</span>}
                      {route.estimated_duration_minutes && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{route.estimated_duration_minutes}min</span>}
                      {route.estimated_distance_km && <span>{route.estimated_distance_km}km</span>}
                      {route.bin_ids.length > 0 && <span>{route.bin_ids.length} bins</span>}
                    </div>
                    {route.scheduled_at && <p className="text-xs text-muted-foreground mt-1">Scheduled: {formatDateTime(route.scheduled_at)}</p>}
                    {route.notes && <p className="text-xs text-muted-foreground mt-1">{route.notes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {route.status === 'pending' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(route.id, 'in_progress')}>
                        <Play className="h-3.5 w-3.5 mr-1" />Start
                      </Button>
                    )}
                    {route.status === 'in_progress' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(route.id, 'completed')}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteRoute(route.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Collection Route</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1"><Label>Route Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Zone A Morning Route" /></div>
            <div className="space-y-1"><Label>Driver</Label><Input value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Vehicle</Label><Input value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="Truck-01" /></div>
            <div className="space-y-1"><Label>Est. Duration (min)</Label><Input type="number" value={form.estimated_duration_minutes} onChange={e => setForm(f => ({ ...f, estimated_duration_minutes: +e.target.value }))} /></div>
            <div className="space-y-1"><Label>Est. Distance (km)</Label><Input type="number" value={form.estimated_distance_km} onChange={e => setForm(f => ({ ...f, estimated_distance_km: +e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <p className="text-xs text-muted-foreground">Will include {Math.min(highFillBins.length, 8)} high-priority bins (≥75% full)</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreate}>Create Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
