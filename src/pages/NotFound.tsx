import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <p className="text-xl font-semibold">Page not found</p>
      <Button asChild variant="outline">
        <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Link>
      </Button>
    </div>
  )
}
