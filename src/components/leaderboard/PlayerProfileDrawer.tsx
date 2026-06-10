import { useEffect, useState } from 'react'
import { fetchPlayerProfile, type PlayerProfile, type ScoreRow } from '../../lib/leaderboard'

function ScoreList({ title, rows }: { title: string; rows: ScoreRow[] }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nothing yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-space-800/50 px-3 py-2 text-sm"
            >
              <span className="text-slate-400">
                {row.mapSize} ·{' '}
                {Math.floor(row.durationS / 60)}:{String(row.durationS % 60).padStart(2, '0')} ·{' '}
                {new Date(row.createdAt).toLocaleDateString()}
              </span>
              <span className="font-display tabular-nums text-slate-100">
                {row.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PlayerProfileDrawer({
  playerId,
  onClose,
}: {
  playerId: string
  onClose: () => void
}) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setProfile(null)
    setError(null)
    fetchPlayerProfile(playerId)
      .then((p) => {
        if (!cancelled) setProfile(p)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile')
      })
    return () => {
      cancelled = true
    }
  }, [playerId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50" role="presentation" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Player profile"
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-space-900 p-6 sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-slate-100">
            {profile?.nickname ?? 'Loading…'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            ×
          </button>
        </div>
        {error ? (
          <p className="mt-4 text-sm text-rose-400">{error}</p>
        ) : profile ? (
          <div className="mt-5 space-y-6">
            <ScoreList title="Best runs" rows={profile.best} />
            <ScoreList title="Recent scores" rows={profile.recent} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Loading profile…</p>
        )}
      </aside>
    </div>
  )
}
