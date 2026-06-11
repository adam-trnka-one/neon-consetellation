import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { useAuth, usePlayerId } from '../lib/auth/AuthContext'
import { getLocalNickname, setLocalNickname } from '../lib/identity'
import { updateNickname } from '../lib/leaderboard'
import { leaderboardConfigured } from '../lib/supabase'

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [
      { title: 'Settings — Neon Space' },
      { name: 'description', content: 'Choose how your name appears on the global leaderboard.' },
    ],
  }),
  component: SettingsPage,
})

function SettingsPage() {
  const { user } = useAuth()
  const playerId = usePlayerId()
  const [nickname, setNickname] = useState(() => getLocalNickname())
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const save = async () => {
    const name = nickname.trim()
    if (name.length < 2) {
      setStatus('error')
      setMessage('Nickname must be at least 2 characters.')
      return
    }
    setStatus('saving')
    try {
      setLocalNickname(name)
      if (leaderboardConfigured && playerId) {
        await updateNickname(playerId, name)
      }
      setStatus('saved')
      setMessage(
        leaderboardConfigured
          ? 'Saved — your leaderboard entries now show this name.'
          : 'Saved locally. (Leaderboard is not configured in this build.)',
      )
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <PageShell
      title="Settings"
      subtitle="Your identity is an anonymous ID stored on this device. The nickname controls how you appear on the global leaderboard."
    >
      <div className="mb-8 rounded-2xl border border-white/10 bg-space-900/80 p-5">
        {user ? (
          <>
            <p className="text-sm text-slate-400">
              Signed in as <span className="text-slate-100">{user.email}</span> — your nickname
              and scores follow this account on every device.
            </p>
            <Link to="/login" className="mt-2 inline-block text-sm text-neon-cyan underline">
              Manage account
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-400">
              You're playing anonymously on this device.{' '}
              <Link to="/login" className="text-neon-cyan underline">
                Sign in or create an account
              </Link>{' '}
              to keep your scores everywhere.
            </p>
          </>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="space-y-6"
      >
        <div>
          <span className="mb-3 block font-display text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">
            Nickname
          </span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Anonymous"
            minLength={2}
            maxLength={24}
            className="w-full rounded-xl border border-white/15 bg-space-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none"
          />
          <p className="mt-2 text-xs text-slate-500">2–24 characters.</p>
        </div>
        <button
          type="submit"
          disabled={status === 'saving'}
          className="cursor-pointer rounded-full bg-neon-cyan px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-space-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-300 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save nickname'}
        </button>
        {message && (
          <p className={`text-sm ${status === 'error' ? 'text-rose-400' : 'text-slate-300'}`}>
            {message}
          </p>
        )}
      </form>
    </PageShell>
  )
}
