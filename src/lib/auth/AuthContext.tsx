import type { User } from '@supabase/supabase-js'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getLocalNickname, getOrCreatePlayerId } from '../identity'
import { ensurePlayer } from '../leaderboard'
import { leaderboardConfigured, supabase } from '../supabase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }>
  signIn(email: string, password: string): Promise<void>
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  // emails a password-reset link that lands on /reset-password
  resetPassword(email: string): Promise<void>
  updatePassword(password: string): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function defaultNickname(user: User): string {
  const local = getLocalNickname()
  if (local.length >= 2) return local
  const meta = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? '') as string
  const fromMeta = meta.trim().slice(0, 24)
  if (fromMeta.length >= 2) return fromMeta
  return user.email?.split('@')[0].slice(0, 24) ?? 'Anonymous'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      // make sure a leaderboard row exists for the account
      if (session?.user) {
        ensurePlayer(session.user.id, defaultNickname(session.user)).catch(() => {})
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    async signUp(email, password) {
      if (!supabase) throw new Error('Accounts are not configured in this build')
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return { needsConfirmation: !data.session }
    },
    async signIn(email, password) {
      if (!supabase) throw new Error('Accounts are not configured in this build')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signInWithGoogle() {
      if (!supabase) throw new Error('Accounts are not configured in this build')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` },
      })
      if (error) throw error
    },
    async signOut() {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    async resetPassword(email) {
      if (!supabase) throw new Error('Accounts are not configured in this build')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    },
    async updatePassword(password) {
      if (!supabase) throw new Error('Accounts are not configured in this build')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Signed-in users are identified by their account; everyone else keeps the
// anonymous device-local UUID.
export function usePlayerId(): string | null {
  const { user } = useAuth()
  if (user) return user.id
  return leaderboardConfigured ? getOrCreatePlayerId() : null
}
