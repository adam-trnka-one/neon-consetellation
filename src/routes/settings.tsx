import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { getLocalNickname, getOrCreatePlayerId, setLocalNickname } from '../lib/identity'
import { updateNickname } from '../lib/leaderboard'
import { leaderboardConfigured } from '../lib/supabase'

export const Route = createFileRoute('/settings')({
  head: () => ({
    meta: [
      { title: 'Settings — Neon Constellations' },
      { name: 'description', content: 'Choose how your name appears on the global leaderboard.' },
    ],
  }),
  component: SettingsPage,
})

function SettingsPage() {
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
      if (leaderboardConfigured) {
        await updateNickname(getOrCreatePlayerId(), name)
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
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-slate-100">Settings</h1>
      <p className="mt-2 text-sm text-slate-400">
        Your identity is an anonymous ID stored on this device. The nickname controls how you
        appear on the global leaderboard.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="mt-8 space-y-4"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-300">Nickname</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Anonymous"
            minLength={2}
            maxLength={24}
            className="w-full rounded-lg border border-white/15 bg-space-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none"
          />
          <span className="mt-1 block text-xs text-slate-500">2–24 characters.</span>
        </label>
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save nickname'}
        </Button>
        {message && (
          <p className={`text-sm ${status === 'error' ? 'text-rose-400' : 'text-slate-300'}`}>
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
