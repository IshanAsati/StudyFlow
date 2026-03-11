import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-sm text-muted-foreground">Loading account...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
