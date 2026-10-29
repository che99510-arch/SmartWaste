import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useMaintenance, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '@/hooks/useMaintenance'
import { useBins } from '@/hooks/useBins'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Wrench, Trash2, CheckCircle, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

const PRIORITY_COLOR: Record<string, any> = { low: 'secondary', medium: 'outline', high: 'warning', urgent: 'destructive' }
const STATUS_COLOR: Record<string, any> = { scheduled: 'secondary', in_progress: 'warning', completed: 'success', cancelled: 'destructive' }

export default function Maintenance() {
  const { data: all = [], isLoading } = useMaintenance()
  const { data: bins = [] } = useBins()
  const create = useCreateMaintenance()
  const update = useUpdateMaintenance()
  const remove = useDeleteMaintenance()

  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    bin_id: '', maintenance_type: 'inspection' as const, title: '', description: '',
    assigned_to: '', priority: 'medium' as const, scheduled_at: '',
  })

  const upcoming = all.filter(m => m.status !== 'completed' && m.status !== 'cancelled')
  const completed = all.filter(m => m.status === 'completed' || m.status === 'cancelled')

  const handleCreate = async () => {
    try {
      await create.mutateAsync({ ...form, scheduled_at: new Date(form.scheduled_at).toISOString() })
      toast.success('Maintenance scheduled')
      setShowDialog(false)
    } catch (e: any) { toast.error(e.message) }
  }

  const markComplete = async (id: string) => {
    try {
      await update.mutateAsync({ id, updates: { status: 'completed', completed_at: new Date().toISOString() } })
      toast.success('Marked complete')
    } catch (e: any) { toast.error(e.message) }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id)
      toast.success('Deleted')
    } catch (e: any) { toast.error(e.message) }
  }

  function MaintenanceCard({ m }: { m: ReturnType<typeof useMaintenance>['data'] extends (infer T)[] ? T : never }) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-sm">{m.title}</p>
                <Badge variant={PRIORITY_COLOR[m.priority]} className="capitalize text-xs">{m.priority}</Badge>
                <Badge variant={STATUS_COLOR[m.status]} className="capitalize text-xs">{m.status.replace('_',' ')}</Badge>
              </div>
              {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(m.scheduled_at)}</span>
                <span>{m.waste_bins?.bin_id} — {m.waste_bins?.location_name}</span>
                {m.assigned_to && <span>Assigned: {m.assigned_to}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {m.status !== 'completed' && m.status !== 'cancelled' && (
                <Button size="sm" variant="outline" onClick={() => markComplete(m.id)}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />Done
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(m.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Maintenance</h1>
            <p className="text-muted-foreground text-sm">{upcoming.length} upcoming tasks</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Schedule Task
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="history">History ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />) :
              upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Wrench className="h-12 w-12" /><p>No upcoming maintenance tasks</p>
                </div>
              ) : upcoming.map(m => <MaintenanceCard key={m.id} m={m} />)
            }
          </TabsContent>
          <TabsContent value="history" className="mt-4 space-y-3">
            {completed.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-sm">No history yet</p>
            ) : completed.map(m => <MaintenanceCard key={m.id} m={m} />)}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Schedule Maintenance</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1"><Label>Bin</Label>
              <Select value={form.bin_id} onValueChange={v => setForm(f => ({ ...f, bin_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select bin..." /></SelectTrigger>
                <SelectContent>{bins.map(b => <SelectItem key={b.id} value={b.id}>{b.bin_id} — {b.location_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Type</Label>
              <Select value={form.maintenance_type} onValueChange={v => setForm(f => ({ ...f, maintenance_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['inspection','cleaning','repair','replacement','battery'].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['low','medium','high','urgent'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Scheduled At</Label><Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>Assigned To</Label><Input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} /></div>
            <div className="col-span-2 space-y-1"><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreate} disabled={!form.bin_id || !form.title || !form.scheduled_at || create.isPending}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
