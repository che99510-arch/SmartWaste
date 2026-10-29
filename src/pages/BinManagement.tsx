import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useBins, useCreateBin, useDeleteBin, useUpdateBin } from '@/hooks/useBins'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getFillBg, getFillColor, timeAgo } from '@/lib/utils'
import { Plus, Search, Trash2, Edit, Eye, Battery } from 'lucide-react'
import { toast } from 'sonner'
import type { WasteBin, Database } from '@/integrations/supabase/types'

type BinInsert = Database['public']['Tables']['waste_bins']['Insert']

const BLANK: BinInsert = { bin_id: '', location_name: '', latitude: 5.963, longitude: 10.159, zone: 'Zone A', capacity_liters: 240, fill_level: 0, status: 'active', waste_type: 'general', battery_level: 100 }

export default function BinManagement() {
  const { data: bins = [], isLoading } = useBins()
  const createBin = useCreateBin()
  const updateBin = useUpdateBin()
  const deleteBin = useDeleteBin()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDialog, setShowDialog] = useState(false)
  const [editBin, setEditBin] = useState<WasteBin | null>(null)
  const [form, setForm] = useState<BinInsert>(BLANK)

  const filtered = bins.filter(b => {
    const matchSearch = b.bin_id.toLowerCase().includes(search.toLowerCase()) || b.location_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const openAdd = () => { setEditBin(null); setForm(BLANK); setShowDialog(true) }
  const openEdit = (bin: WasteBin) => { setEditBin(bin); setForm({ ...bin }); setShowDialog(true) }

  const handleSave = async () => {
    try {
      if (editBin) {
        await updateBin.mutateAsync({ id: editBin.id, updates: form })
        toast.success('Bin updated')
      } else {
        await createBin.mutateAsync(form)
        toast.success('Bin added')
      }
      setShowDialog(false)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (bin: WasteBin) => {
    if (!confirm(`Delete ${bin.bin_id}?`)) return
    try {
      await deleteBin.mutateAsync(bin.id)
      toast.success('Bin deleted')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Bin Management</h1>
            <p className="text-muted-foreground text-sm">{bins.length} bins registered</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Bin
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search bins..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Fill Level</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Collected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}
                    </TableRow>
                  ))
                ) : filtered.map(bin => (
                  <TableRow key={bin.id}>
                    <TableCell className="font-mono font-medium">{bin.bin_id}</TableCell>
                    <TableCell className="max-w-36 truncate">{bin.location_name}</TableCell>
                    <TableCell>{bin.zone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-24">
                        <Progress value={bin.fill_level} className="h-1.5 flex-1" />
                        <span className={`text-xs font-semibold w-8 text-right ${getFillColor(bin.fill_level)}`}>{bin.fill_level}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Battery className={`h-3.5 w-3.5 ${bin.battery_level < 20 ? 'text-red-500' : 'text-green-500'}`} />
                        <span className="text-sm">{bin.battery_level}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bin.status === 'active' ? 'success' : bin.status === 'full' ? 'destructive' : 'warning'} className="capitalize text-xs">
                        {bin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {bin.last_collected ? timeAgo(bin.last_collected) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/bins/${bin.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(bin)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(bin)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isLoading && filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-10 text-sm">No bins found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editBin ? 'Edit Bin' : 'Add New Bin'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1"><Label>Bin ID</Label><Input value={form.bin_id} onChange={e => setForm(f => ({ ...f, bin_id: e.target.value }))} placeholder="BIN-013" /></div>
            <div className="space-y-1"><Label>Location</Label><Input value={form.location_name} onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Zone</Label>
              <Select value={form.zone} onValueChange={v => setForm(f => ({ ...f, zone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Zone A','Zone B','Zone C','Zone D','Zone E'].map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Waste Type</Label>
              <Select value={form.waste_type} onValueChange={v => setForm(f => ({ ...f, waste_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['general','recyclable','organic','hazardous'].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['active','maintenance','offline','full'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Capacity (L)</Label><Input type="number" value={form.capacity_liters} onChange={e => setForm(f => ({ ...f, capacity_liters: +e.target.value }))} /></div>
            <div className="space-y-1"><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: +e.target.value }))} /></div>
            <div className="space-y-1"><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: +e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={createBin.isPending || updateBin.isPending}>
              {editBin ? 'Save Changes' : 'Add Bin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
