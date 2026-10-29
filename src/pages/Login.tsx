import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Recycle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await signUp(form.email, form.password, form.fullName)
        if (error) throw error
        toast.success('Account created! Check your email to verify.')
        setMode('login')
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center mb-3">
            <Recycle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-900">Bamenda SmartWaste</h1>
          <p className="text-green-700 text-sm mt-1">AI-Powered Waste Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === 'login' ? 'Sign in' : 'Create account'}</CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Enter your credentials to access the dashboard' : 'Register for a new operator account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Emmanuel Fru" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button className="text-green-600 font-medium hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
