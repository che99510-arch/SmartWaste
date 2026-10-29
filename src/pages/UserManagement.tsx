import { DashboardLayout } from '@/components/DashboardLayout'
import { useProfiles, useUpdateProfile } from '@/hooks/useProfiles'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Profile } from '@/integrations/supabase/types'

const ROLE_COLOR: Record<string, any> = { admin: 'destructive', operator: 'warning', viewer: 'secondary' }

export default function UserManagement() {
  const { data: profiles = [], isLoading } = useProfiles()
  const { profile: currentProfile } = useAuth()
  const updateProfile = useUpdateProfile()

  const isAdmin = currentProfile?.role === 'admin'

  const handleRoleChange = async (userId: string, role: Profile['role']) => {
    if (!isAdmin) return toast.error('Only admins can change roles')
    try {
      await updateProfile.mutateAsync({ id: userId, updates: { role } })
      toast.success('Role updated')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">{profiles.length} registered users</p>
        </div>

        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            You need admin privileges to modify user roles.
          </div>
        )}

        <Card>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(4)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}
                    </TableRow>
                  ))
                ) : profiles.map(profile => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
                          {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{profile.full_name ?? 'Unnamed'}</p>
                          {profile.id === currentProfile?.id && <p className="text-xs text-muted-foreground">You</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_COLOR[profile.role] ?? 'secondary'} className="capitalize">{profile.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {isAdmin && profile.id !== currentProfile?.id ? (
                        <Select value={profile.role} onValueChange={v => handleRoleChange(profile.id, v as Profile['role'])}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">{profile.id === currentProfile?.id ? 'Your account' : '—'}</span>
                      )}
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
