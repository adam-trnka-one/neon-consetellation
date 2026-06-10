import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { AiDifficulty, MapSize } from '../../game/types'
import { randomSeedString } from '../../game/rng'

const optionBase =
  'rounded-xl border px-4 py-3 text-center font-display text-sm font-semibold transition-colors cursor-pointer'
const optionIdle = 'border-white/15 bg-space-900 text-slate-200 hover:bg-white/5'
const optionCyan =
  'border-transparent bg-neon-cyan text-space-950 shadow-[0_0_18px_rgba(34,211,238,0.4)]'
const optionViolet =
  'border-transparent bg-neon-violet text-space-950 shadow-[0_0_18px_rgba(167,139,250,0.35)]'
const optionVioletOutline = 'border-neon-violet/70 bg-neon-violet/15 text-slate-100'

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="mb-3 block font-display text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">
      {children}
    </span>
  )
}

export function MatchSetupForm() {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(2)
  const [aiDiffs, setAiDiffs] = useState<AiDifficulty[]>(['normal', 'normal', 'normal'])
  const [mapSize, setMapSize] = useState<MapSize>('medium')
  const [seedText, setSeedText] = useState('')

  const aiCount = playerCount - 1

  const start = () => {
    const seed = seedText.trim() ? seedText.trim().toUpperCase() : randomSeedString()
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
      className="space-y-9"
    >
      <div>
        <SectionLabel>Players</SectionLabel>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Players">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={playerCount === n}
              onClick={() => setPlayerCount(n)}
              className={`${optionBase} ${playerCount === n ? optionCyan : optionIdle}`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          You + {aiCount} AI opponent{aiCount > 1 ? 's' : ''}
        </p>
      </div>

      <div>
        <SectionLabel>AI difficulty</SectionLabel>
        <div className="space-y-3">
          {Array.from({ length: aiCount }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-xs text-slate-500">AI {i + 1}</span>
              <div
                className="grid flex-1 grid-cols-3 gap-2"
                role="radiogroup"
                aria-label={`AI ${i + 1} difficulty`}
              >
                {(['easy', 'normal', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={aiDiffs[i] === d}
                    onClick={() => {
                      const next = aiDiffs.slice()
                      next[i] = d
                      setAiDiffs(next)
                    }}
                    className={`${optionBase} !py-2.5 capitalize ${
                      aiDiffs[i] === d ? optionVioletOutline : optionIdle
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Map size</SectionLabel>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Map size">
          {(
            [
              ['small', 'Small'],
              ['medium', 'Medium'],
              ['large', 'Large'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mapSize === value}
              onClick={() => setMapSize(value)}
              className={`${optionBase} ${mapSize === value ? optionViolet : optionIdle}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">9 / 14 / 20 planets</p>
      </div>

      <div>
        <SectionLabel>Seed (optional)</SectionLabel>
        <input
          value={seedText}
          onChange={(e) => setSeedText(e.target.value)}
          placeholder="Leave blank for random"
          maxLength={32}
          className="w-full rounded-xl border border-white/15 bg-space-900 px-4 py-3 font-mono text-sm uppercase text-slate-100 placeholder:normal-case placeholder:text-slate-600 focus:border-neon-cyan/60 focus:outline-none"
        />
        <p className="mt-2 text-xs text-slate-500">Same seed + same settings = same map.</p>
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer rounded-full bg-neon-cyan py-3.5 font-display text-sm font-bold uppercase tracking-[0.25em] text-space-950 shadow-[0_0_28px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-300"
      >
        Launch
      </button>
    </form>
  )
}
