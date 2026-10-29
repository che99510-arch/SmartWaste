import { DashboardLayout } from '@/components/DashboardLayout'
import { useAlerts, useResolveAlert } from '@/hooks/useAlerts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import { toast } from 'sonner'

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, any> = { critical: 'destructive', high: 'warning', medium: 'secondary', low: 'outline' }
  return <Badge variant={map[severity] ?? 'secondary'} className="capitalize text-xs">{severity}</Badge>
}

function AlertList({ resolved }: { resolved: boolean }) {
  const { data: alerts = [], isLoading } = useAlerts(resolved)
  const resolve = useResolveAlert()

  const handleResolve = async (id: string) => {
    try {
      await resolve.mutateAsync(id)
      toast.success('Alert resolved')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (isLoading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
  if (alerts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <CheckCircle className="h-12 w-12 text-green-400" />
      <p>{resolved ? 'No resolved alerts' : 'No active alerts — all clear!'}</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <Card key={alert.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                alert.severity === 'critical' ? 'text-red-500' :
                alert.severity === 'high' ? 'text-orange-500' :
                alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <SeverityBadge severity={alert.severity} />
                  <Badge variant="outline" className="capitalize text-xs">{alert.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(alert.created_at)}
                  {alert.waste_bins && <span>· {alert.waste_bins.bin_id} — {alert.waste_bins.location_name}</span>}
                </div>
              </div>
              {!resolved && (
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => handleResolve(alert.id)} disabled={resolve.isPending}>
                  Resolve
                </Button>
              )}
              {resolved && alert.resolved_at && (
                <span className="text-xs text-muted-foreground shrink-0">Resolved {timeAgo(alert.resolved_at)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function Alerts() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground text-sm">System alerts and notifications</p>
        </div>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4"><AlertList resolved={false} /></TabsContent>
          <TabsContent value="resolved" className="mt-4"><AlertList resolved={true} /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
