import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { computeScore } from '../../game/score'
import type { MatchResult } from '../../game/types'
import { getLocalNickname, getOrCreatePlayerId, setLocalNickname } from '../../lib/identity'
import { submitScore } from '../../lib/leaderboard'
import { leaderboardConfigured } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { MatchCharts } from './MatchCharts'
import { ShareCard } from './ShareCard'

type SubmitState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'done'; rank: number; score: number }
  | { phase: 'error'; message: string }

export function MatchEndOverlay({
  result,
  onRestart,
}: {
  result: MatchResult
  onRestart: () => void
}) {
  const navigate = useNavigate()
  const score = computeScore(result, result.config)
  const [nickname, setNickname] = useState(() => getLocalNickname())
  const [submit, setSubmit] = useState<SubmitState>({ phase: 'idle' })

  const doSubmit = async () => {
    setSubmit({ phase: 'submitting' })
    try {
      const name = nickname.trim() || 'Anonymous'
      setLocalNickname(name)
      const { rank } = await submitScore(getOrCreatePlayerId(), name, result)
      setSubmit({ phase: 'done', rank, score })
    } catch (err) {
      setSubmit({ phase: 'error', message: err instanceof Error ? err.message : 'Submit failed' })
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex overflow-y-auto bg-space-950/80 p-4 backdrop-blur-sm">
      <div className="m-auto w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-space-900 p-6 shadow-2xl">
        <div className="text-center">
          <h2
            className={`font-display text-4xl font-bold tracking-widest glow-text ${result.won ? 'text-neon-cyan' : 'text-rose-400'}`}
          >
            {result.won ? 'VICTORY' : 'DEFEAT'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {Math.floor(result.durationS / 60)}:{String(result.durationS % 60).padStart(2, '0')} ·{' '}
            {result.config.mapSize} map · seed{' '}
            <span className="font-mono text-slate-300">{result.config.seed}</span>
          </p>
          {result.won && (
            <p className="mt-3 font-display text-2xl text-slate-100">
              {score.toLocaleString()} <span className="text-sm text-slate-500">points</span>
            </p>
          )}
        </div>

        <ShareCard result={result} score={score} />

        <MatchCharts result={result} />

        {result.won && (
          <div className="rounded-xl border border-white/10 bg-space-800/60 p-4">
            {!leaderboardConfigured ? (
              <p className="text-sm text-slate-500">
                Global leaderboard is not configured in this build.
              </p>
            ) : submit.phase === 'done' ? (
              <p className="text-sm text-slate-300">
                Submitted! You're ranked{' '}
                <span className="font-display text-neon-cyan glow-text">#{submit.rank}</span> with{' '}
                {submit.score.toLocaleString()} points.{' '}
                <Link to="/leaderboard" search={{ tab: 'single', page: 1 }} className="underline">
                  View leaderboard
                </Link>
              </p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Nickname"
                  maxLength={24}
                  className="flex-1 rounded-lg border border-white/15 bg-space-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none"
                />
                <Button onClick={doSubmit} disabled={submit.phase === 'submitting'}>
                  {submit.phase === 'submitting' ? 'Submitting…' : 'Submit score'}
                </Button>
              </div>
            )}
            {submit.phase === 'error' && (
              <p className="mt-2 text-sm text-rose-400">{submit.message}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={onRestart}>Play again</Button>
          <Button variant="ghost" onClick={() => navigate({ to: '/play' })}>
            New match
          </Button>
        </div>
      </div>
    </div>
  )
}
