import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { mockMaintenance, mockBins } from '@/data/mockData'
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
import type { MaintenanceSchedule } from '@/types'

const PRIORITY_COLOR: Record<string, any> = { low: 'secondary', medium: 'outline', high: 'warning', urgent: 'destructive' }
const STATUS_COLOR: Record<string, any> = { scheduled: 'secondary', in_progress: 'warning', completed: 'success', cancelled: 'destructive' }

export default function Maintenance() {
  const [tasks, setTasks] = useState<MaintenanceSchedule[]>(mockMaintenance)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ bin_id: '', maintenance_type: 'inspection' as const, title: '', description: '', assigned_to: '', priority: 'medium' as const, scheduled_at: '' })

  const upcoming = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const history = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled')

  const handleCreate = () => {
    if (!form.bin_id || !form.title || !form.scheduled_at) return toast.error('Fill required fields')
    const task: MaintenanceSchedule = {
      ...form, id: Date.now().toString(), status: 'scheduled', completed_at: null, notes: null, created_by: 'u1',
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    setTasks(prev => [...prev, task])
    toast.success('Maintenance scheduled')
    setShowDialog(false)
  }

  const markComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t))
    toast.success('Marked complete')
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    toast.success('Deleted')
  }

  const getBinLabel = (binId: string) => {
    const b = mockBins.find(b => b.id === binId)
    return b ? `${b.bin_id} — ${b.location_name}` : binId
  }

  function TaskCard({ t }: { t: MaintenanceSchedule }) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-sm">{t.title}</p>
                <Badge variant={PRIORITY_COLOR[t.priority]} className="capitalize text-xs">{t.priority}</Badge>
                <Badge variant={STATUS_COLOR[t.status]} className="capitalize text-xs">{t.status.replace('_',' ')}</Badge>
              </div>
              {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(t.scheduled_at)}</span>
                <span>{getBinLabel(t.bin_id)}</span>
                {t.assigned_to && <span>Assigned: {t.assigned_to}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {t.status !== 'completed' && t.status !== 'cancelled' && (
                <Button size="sm" variant="outline" onClick={() => markComplete(t.id)}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />Done
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTask(t.id)}>
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
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Wrench className="h-12 w-12" /><p>No upcoming maintenance</p>
              </div>
            ) : upcoming.map(t => <TaskCard key={t.id} t={t} />)}
          </TabsContent>
          <TabsContent value="history" className="mt-4 space-y-3">
            {history.length === 0 ? <p className="text-center text-muted-foreground py-10 text-sm">No history</p>
              : history.map(t => <TaskCard key={t.id} t={t} />)}
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
                <SelectContent>{mockBins.map(b => <SelectItem key={b.id} value={b.id}>{b.bin_id} — {b.location_name}</SelectItem>)}</SelectContent>
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
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreate}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
