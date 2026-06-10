import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable'
import { NicknameSearch } from '../components/leaderboard/NicknameSearch'
import { PlayerProfileDrawer } from '../components/leaderboard/PlayerProfileDrawer'
import { Button } from '../components/ui/Button'
import { getOrCreatePlayerId } from '../lib/identity'
import {
  fetchMyBest,
  fetchRank,
  fetchScores,
  PAGE_SIZE,
  searchNickname,
  type ScoreRow,
} from '../lib/leaderboard'
import { leaderboardSearchSchema } from '../lib/searchSchemas'
import { leaderboardConfigured } from '../lib/supabase'

export const Route = createFileRoute('/leaderboard')({
  validateSearch: leaderboardSearchSchema,
  head: () => ({
    meta: [
      { title: 'Leaderboard — Neon Space' },
      { name: 'description', content: 'Global high scores for Neon Space.' },
      { property: 'og:title', content: 'Neon Space leaderboard' },
    ],
  }),
  component: LeaderboardPage,
})

type Loaded = { rows: ScoreRow[]; ranks: Array<number | null> | undefined }

function LeaderboardPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const myPlayerId = useMemo(
    () => (leaderboardConfigured ? getOrCreatePlayerId() : null),
    [],
  )

  const [data, setData] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [myBest, setMyBest] = useState<{ score: number; rank: number } | null>(null)

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) })

  useEffect(() => {
    if (!leaderboardConfigured) return
    let cancelled = false
    setData(null)
    setError(null)
    const load = async (): Promise<Loaded> => {
      if (search.q) {
        const rows = await searchNickname(search.tab, search.q)
        const ranks = await Promise.all(
          rows.map((r) => fetchRank(search.tab, r.score).catch(() => null)),
        )
        return { rows, ranks }
      }
      return { rows: await fetchScores(search.tab, search.page), ranks: undefined }
    }
    load()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
    return () => {
      cancelled = true
    }
  }, [search.tab, search.q, search.page])

  useEffect(() => {
    if (!leaderboardConfigured || !myPlayerId) return
    let cancelled = false
    setMyBest(null)
    fetchMyBest(myPlayerId, search.tab)
      .then((b) => {
        if (!cancelled) setMyBest(b)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [myPlayerId, search.tab])

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-100">Leaderboard</h1>

      {!leaderboardConfigured ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-space-900 p-5 text-slate-400">
          The global leaderboard isn't configured in this build (missing Supabase credentials).
          Your matches still work — scores just can't be submitted.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-lg border border-white/10 p-1" role="tablist">
              {(['single', 'multi'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={search.tab === tab}
                  onClick={() => setSearch({ tab, page: 1 })}
                  className={`rounded-md px-4 py-1.5 font-display text-sm font-semibold transition-colors cursor-pointer ${
                    search.tab === tab
                      ? 'bg-neon-cyan/15 text-neon-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'single' ? 'Single player' : 'Multiplayer'}
                </button>
              ))}
            </div>
            <NicknameSearch
              value={search.q ?? ''}
              onSearch={(q) => setSearch({ q: q || undefined, page: 1 })}
            />
          </div>

          {myBest && (
            <div className="mt-4 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-3 text-sm text-slate-300">
              Your best on this board:{' '}
              <span className="font-display text-neon-cyan">{myBest.score.toLocaleString()}</span>{' '}
              points — rank <span className="font-display text-neon-cyan">#{myBest.rank}</span>
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-space-900">
            {search.tab === 'multi' ? (
              <p className="p-8 text-center text-slate-500">
                Multiplayer is coming in a later phase — no results here yet.
              </p>
            ) : error ? (
              <p className="p-8 text-center text-rose-400">{error}</p>
            ) : data === null ? (
              <p className="p-8 text-center text-slate-500">Loading…</p>
            ) : data.rows.length === 0 ? (
              <p className="p-8 text-center text-slate-500">
                {search.q ? `No players named “${search.q}”.` : 'No scores yet — be the first!'}
              </p>
            ) : (
              <LeaderboardTable
                rows={data.rows}
                ranks={data.ranks}
                startRank={(search.page - 1) * PAGE_SIZE + 1}
                highlightQuery={search.q}
                myPlayerId={myPlayerId}
                onRowClick={(playerId) => setSearch({ player: playerId })}
              />
            )}
          </div>

          {search.tab === 'single' && !search.q && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="ghost"
                disabled={search.page <= 1}
                onClick={() => setSearch({ page: search.page - 1 })}
              >
                ← Previous
              </Button>
              <span className="text-sm text-slate-500">Page {search.page}</span>
              <Button
                variant="ghost"
                disabled={data !== null && data.rows.length < PAGE_SIZE}
                onClick={() => setSearch({ page: search.page + 1 })}
              >
                Next →
              </Button>
            </div>
          )}

          {search.player && (
            <PlayerProfileDrawer
              playerId={search.player}
              onClose={() => setSearch({ player: undefined })}
            />
          )}
        </>
      )}
    </main>
  )
}
