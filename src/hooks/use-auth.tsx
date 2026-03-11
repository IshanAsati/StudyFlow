import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  appwriteAccount,
  isAppwriteConfigured,
  type User,
} from '@/lib/appwrite'

type Session = {
  id: string
  userId: string
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

function normalizeAuthError(error: unknown) {
  const message = (error as Error)?.message || 'Unknown authentication error'

  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Network/CORS issue. Add your Vercel domain to Appwrite Web Platforms and verify VITE_APPWRITE_ENDPOINT + VITE_APPWRITE_PROJECT_ID in Vercel env.'
  }

  return message
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const mapAccountToUser = useCallback((account: { $id: string; email: string; name: string; $createdAt: string }): User => {
    return {
      id: account.$id,
      email: account.email,
      name: account.name,
      created_at: account.$createdAt,
    }
  }, [])

  useEffect(() => {
    if (!isAppwriteConfigured) {
      setLoading(false)
      return
    }

    const bootstrap = async () => {
      try {
        const account = await appwriteAccount.get()
        const mapped = mapAccountToUser(account)
        setUser(mapped)
        setSession({ id: `session-${mapped.id}`, userId: mapped.id })
      } catch {
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [mapAccountToUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      configured: isAppwriteConfigured,
      signIn: async (email, password) => {
        if (!isAppwriteConfigured) return { error: 'Appwrite is not configured.' }
        if (!email || !password) return { error: 'Email and password are required.' }
        try {
          await appwriteAccount.createEmailPasswordSession(email, password)
          const account = await appwriteAccount.get()
          const mapped = mapAccountToUser(account)
          setUser(mapped)
          setSession({ id: `session-${mapped.id}`, userId: mapped.id })
          return { error: null }
        } catch (error) {
          return { error: normalizeAuthError(error) }
        }
      },
      signUp: async (email, password, name) => {
        if (!isAppwriteConfigured) return { error: 'Appwrite is not configured.' }
        if (!email || !password) return { error: 'Email and password are required.' }
        try {
          const accountName = name?.trim() || email.split('@')[0]
          await appwriteAccount.create('unique()', email, password, accountName)
          await appwriteAccount.createEmailPasswordSession(email, password)
          const account = await appwriteAccount.get()
          const mapped = mapAccountToUser(account)
          setUser(mapped)
          setSession({ id: `session-${mapped.id}`, userId: mapped.id })
          return { error: null }
        } catch (error) {
          return { error: normalizeAuthError(error) }
        }
      },
      signOut: async () => {
        if (!isAppwriteConfigured) return
        try {
          await appwriteAccount.deleteSession('current')
        } finally {
          setUser(null)
          setSession(null)
        }
      },
    }),
    [user, session, loading, mapAccountToUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
