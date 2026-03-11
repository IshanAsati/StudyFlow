import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, getAppwriteConfigDebug } from '@/lib/appwrite'

export function AuthPage() {
  const { signIn, signUp, configured } = useAuth()
  const [showDebug, setShowDebug] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    setError(null)

    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, name)

    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'signup') {
      setError('Check your inbox to confirm your account, then sign in.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'signin' ? 'Sign in to StudyFlow' : 'Create your StudyFlow account'}</CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Sync your tasks, sessions, and analytics across devices.'
              : 'Use your email to create an account and enable cloud sync.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'signup' && (
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" />
          )}
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />

          {!configured && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive space-y-1">
              <p>Appwrite is not configured for this deployment.</p>
              <p>Set these Vercel env vars and redeploy:</p>
              <p>`VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`</p>
            </div>
          )}

          {configured && (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) && (
            <p className="text-xs text-muted-foreground">Double-check Appwrite env values.</p>
          )}

          {error && <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>}

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !configured}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
              setError(null)
            }}
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setShowDebug((value) => !value)}
          >
            {showDebug ? 'Hide connection debug' : 'Show connection debug'}
          </Button>

          {showDebug && (
            <div className="rounded-md border bg-muted/20 p-3 text-xs space-y-1 break-all">
              <p><span className="font-medium">Origin:</span> {window.location.origin}</p>
              <p><span className="font-medium">Endpoint:</span> {APPWRITE_ENDPOINT || '(empty)'}</p>
              <p><span className="font-medium">Project:</span> {APPWRITE_PROJECT_ID || '(empty)'}</p>
              <p><span className="font-medium">Configured:</span> {String(getAppwriteConfigDebug().configured)}</p>
              <p><span className="font-medium">Fully configured:</span> {String(getAppwriteConfigDebug().fullyConfigured)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
