import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { useAuth } from '../lib/auth/AuthContext'
import { leaderboardConfigured } from '../lib/supabase'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'Account — Neon Space' },
      { name: 'description', content: 'Sign in or create a Neon Space account.' },
    ],
  }),
  component: LoginPage,
})

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none'

type Mode = 'signin' | 'signup'

function LoginPage() {
  const { user, loading, signIn, signUp, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (!leaderboardConfigured) {
    return (
      <PageShell title="Account">
        <p className="rounded-xl border border-white/10 bg-space-900 p-5 text-slate-400">
          Accounts aren't configured in this build (missing Supabase credentials).
        </p>
      </PageShell>
    )
  }

  if (loading) {
    return (
      <PageShell title="Account">
        <p className="text-slate-500">Loading…</p>
      </PageShell>
    )
  }

  if (user) {
    return (
      <PageShell title="Account" subtitle="You're signed in.">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-space-900/80 p-5">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="mt-1 font-display text-lg text-slate-100">{user.email}</p>
            <p className="mt-2 text-xs text-slate-500">
              Your scores are tied to this account on every device.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/settings"
              className="rounded-full bg-neon-cyan px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-space-950 shadow-[0_0_18px_rgba(34,211,238,0.4)] hover:bg-cyan-300"
            >
              Nickname settings
            </Link>
            <button
              onClick={() => signOut().catch(() => {})}
              className="cursor-pointer rounded-full border border-white/20 px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </PageShell>
    )
  }

  const submit = async () => {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate({ to: '/settings' })
      } else {
        const { needsConfirmation } = await signUp(email, password)
        if (needsConfirmation) {
          setNotice('Account created — check your inbox to confirm your email, then sign in.')
          setMode('signin')
        } else {
          navigate({ to: '/settings' })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    }
  }

  return (
    <PageShell
      title="Account"
      subtitle="Keep your scores and nickname on every device. Playing without an account works too."
    >
      <div className="flex w-fit rounded-full border border-white/15 p-1" role="tablist">
        {(
          [
            ['signin', 'Sign in'],
            ['signup', 'Create account'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value)
              setError('')
            }}
            className={`cursor-pointer rounded-full px-5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-colors ${
              mode === value
                ? 'bg-neon-cyan text-space-950 shadow-[0_0_18px_rgba(34,211,238,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="mt-6 space-y-4"
      >
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signin' ? 'Password' : 'Password (min. 6 characters)'}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full cursor-pointer rounded-full bg-neon-cyan py-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-space-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-300 disabled:opacity-50"
        >
          {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-600">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={google}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-white/20 py-3 font-display text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.16-3.16C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
          />
        </svg>
        Continue with Google
      </button>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      {notice && <p className="mt-4 text-sm text-neon-cyan">{notice}</p>}
    </PageShell>
  )
}
