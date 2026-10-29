import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { mockAlerts } from '@/data/mockData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { toast } from 'sonner'
import type { Alert } from '@/types'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  const resolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a))
    toast.success('Alert resolved')
  }

  const active = alerts.filter(a => !a.is_resolved)
  const resolved = alerts.filter(a => a.is_resolved)

  const severityIcon = (s: string) => s === 'critical' ? 'text-red-500' : s === 'high' ? 'text-orange-500' : s === 'medium' ? 'text-yellow-500' : 'text-blue-500'
  const severityBadge = (s: string): any => ({ critical: 'destructive', high: 'warning', medium: 'secondary', low: 'outline' })[s] ?? 'secondary'

  function AlertList({ list, showResolve }: { list: Alert[]; showResolve: boolean }) {
    if (list.length === 0) return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <CheckCircle className="h-12 w-12 text-green-400" />
        <p>{showResolve ? 'No active alerts — all clear!' : 'No resolved alerts'}</p>
      </div>
    )
    return (
      <div className="space-y-3">
        {list.map(alert => (
          <Card key={alert.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${severityIcon(alert.severity)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <Badge variant={severityBadge(alert.severity)} className="capitalize text-xs">{alert.severity}</Badge>
                    <Badge variant="outline" className="capitalize text-xs">{alert.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{timeAgo(alert.created_at)}
                    {alert.resolved_at && <span>· Resolved {timeAgo(alert.resolved_at)}</span>}
                  </div>
                </div>
                {showResolve && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => resolve(alert.id)}>Resolve</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground text-sm">{active.length} active alerts</p>
        </div>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4"><AlertList list={active} showResolve={true} /></TabsContent>
          <TabsContent value="resolved" className="mt-4"><AlertList list={resolved} showResolve={false} /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
