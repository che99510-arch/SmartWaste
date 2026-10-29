import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useUpdateProfile } from '@/hooks/useProfiles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

export default function Settings() {
  const { profile, user } = useAuth()
  const updateProfile = useUpdateProfile()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!profile) return
    setSavingProfile(true)
    try {
      await updateProfile.mutateAsync({ id: profile.id, updates: { full_name: fullName, phone } })
      toast.success('Profile updated')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated')
      setNewPassword('')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account preferences</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="font-semibold">{profile?.full_name ?? 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="capitalize mt-1 text-xs">{profile?.role}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground">Contact your admin to change email</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveProfile} disabled={savingProfile}>
              Save Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={savingPassword || !newPassword}>
              Update Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">System Info</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {[
                ['Application', 'Bamenda Smart Waste Monitor'],
                ['Version', '2.0.0'],
                ['Backend', 'Supabase (PostgreSQL + Realtime)'],
                ['Frontend', 'React + Vite + Tailwind'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
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
