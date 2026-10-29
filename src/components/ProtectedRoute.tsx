import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
