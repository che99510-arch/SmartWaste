import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">System configuration</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Demo Account</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">E</div>
              <div>
                <p className="font-semibold">Emmanuel Fru</p>
                <p className="text-sm text-muted-foreground">admin@bamenda-waste.cm</p>
                <Badge variant="outline" className="mt-1 text-xs">Admin</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Alert Thresholds</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {[
                ['Fill Level Warning', '75%'],
                ['Fill Level Critical', '90%'],
                ['Battery Warning', '25%'],
                ['Battery Critical', '10%'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Collection Schedule</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {[
                ['Zone A', 'Every 2 days'],
                ['Zone B', 'Every 3 days'],
                ['Zone C', 'Every 4 days'],
                ['Zone D', 'Every 4 days'],
                ['Zone E', 'Every 5 days'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">System Info</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {[
                ['Application', 'Bamenda Smart Waste Monitor'],
                ['Version', '2.0.0'],
                ['Mode', 'Demo (Frontend Only)'],
                ['Frontend', 'React + Vite + Tailwind'],
                ['Deployment', 'Vercel'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
