import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { AiDifficulty, MapSize } from '../../game/types'
import { randomSeedString } from '../../game/rng'
import { Button } from '../ui/Button'

const selectClass =
  'w-full rounded-lg border border-white/15 bg-space-950 px-3 py-2 text-sm text-slate-100 focus:border-neon-cyan/60 focus:outline-none'

export function MatchSetupForm() {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(2)
  const [aiDiffs, setAiDiffs] = useState<AiDifficulty[]>(['normal', 'normal', 'normal'])
  const [mapSize, setMapSize] = useState<MapSize>('medium')
  const [useSeed, setUseSeed] = useState(false)
  const [seedText, setSeedText] = useState('')

  const aiCount = playerCount - 1

  const start = () => {
    const seed = useSeed && seedText.trim() ? seedText.trim().toUpperCase() : randomSeedString()
    navigate({
      to: '/play/match',
      search: { seed, map: mapSize, ai: aiDiffs.slice(0, aiCount) },
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start()
      }}
      className="space-y-5"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-300">Players</span>
        <select
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className={selectClass}
        >
          {[2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} players (you + {n - 1} AI)
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-3">
        {Array.from({ length: aiCount }, (_, i) => (
          <label key={i} className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">
              AI opponent {i + 1}
            </span>
            <select
              value={aiDiffs[i]}
              onChange={(e) => {
                const next = aiDiffs.slice()
                next[i] = e.target.value as AiDifficulty
                setAiDiffs(next)
              }}
              className={selectClass}
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-300">Map size</span>
        <select
          value={mapSize}
          onChange={(e) => setMapSize(e.target.value as MapSize)}
          className={selectClass}
        >
          <option value="small">Small (12 planets)</option>
          <option value="medium">Medium (20 planets)</option>
          <option value="large">Large (30 planets)</option>
        </select>
      </label>

      <div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={useSeed}
            onChange={(e) => setUseSeed(e.target.checked)}
            className="size-4 accent-cyan-400"
          />
          Use a specific seed
        </label>
        {useSeed && (
          <input
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            placeholder="e.g. NEON42"
            maxLength={32}
            className={`mt-2 ${selectClass} font-mono uppercase placeholder:normal-case`}
          />
        )}
        <p className="mt-1 text-xs text-slate-500">
          The same seed always generates the same map.
        </p>
      </div>

      <Button type="submit" className="w-full !py-3 text-base">
        Start match
      </Button>
    </form>
  )
}
