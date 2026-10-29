import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { mockProfiles } from '@/data/mockData'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Profile } from '@/types'

const ROLE_COLOR: Record<string, any> = { admin: 'destructive', operator: 'warning', viewer: 'secondary' }

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles)

  const updateRole = (id: string, role: Profile['role']) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p))
    toast.success('Role updated')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">{profiles.length} registered users</p>
        </div>

        <Card>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
                          {p.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <p className="font-medium text-sm">{p.full_name ?? 'Unnamed'}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={ROLE_COLOR[p.role]} className="capitalize">{p.role}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.phone ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Select value={p.role} onValueChange={v => updateRole(p.id, v as Profile['role'])}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
