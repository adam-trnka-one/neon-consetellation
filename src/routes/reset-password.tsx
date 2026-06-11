import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { useAuth } from '../lib/auth/AuthContext'
import { leaderboardConfigured } from '../lib/supabase'

export const Route = createFileRoute('/reset-password')({
  head: () => ({
    meta: [
      { title: 'Reset password — Neon Space' },
      { name: 'description', content: 'Set a new password for your Neon Space account.' },
    ],
  }),
  component: ResetPasswordPage,
})

const inputClass =
  'w-full rounded-xl border border-white/15 bg-space-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none'

function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!leaderboardConfigured) {
    return (
      <PageShell title="Reset password">
        <p className="rounded-xl border border-white/10 bg-space-900 p-5 text-slate-400">
          Accounts aren't configured in this build.
        </p>
      </PageShell>
    )
  }

  if (loading) {
    return (
      <PageShell title="Reset password">
        <p className="text-slate-500">Loading…</p>
      </PageShell>
    )
  }

  // the reset email link signs the visitor in with a recovery session;
  // arriving here without one means the link is missing or expired
  if (!user) {
    return (
      <PageShell title="Reset password">
        <p className="text-slate-400">
          This page only works when opened from the link in a password-reset email. The link may
          have expired —{' '}
          <Link to="/login" className="text-neon-cyan underline">
            request a new one
          </Link>
          .
        </p>
      </PageShell>
    )
  }

  if (done) {
    return (
      <PageShell title="Reset password" subtitle="All set.">
        <p className="text-slate-300">
          Your password has been updated. You're signed in as{' '}
          <span className="text-slate-100">{user.email}</span>.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-neon-cyan px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-space-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] hover:bg-cyan-300"
        >
          Back to the game
        </Link>
      </PageShell>
    )
  }

  const submit = async () => {
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Reset password" subtitle={`Choose a new password for ${user.email}.`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-4"
      >
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min. 6 characters)"
          className={inputClass}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat new password"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full cursor-pointer rounded-full bg-neon-cyan py-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-space-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-300 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Set new password'}
        </button>
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </form>
    </PageShell>
  )
}
