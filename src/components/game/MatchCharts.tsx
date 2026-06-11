import { ownerColor } from '../../game/render/palette'
import type { MatchResult, TimelineSample } from '../../game/types'
import { slotName } from './ShareCard'

const W = 320
const H = 96
const PAD = 8

function Chart({
  title,
  timeline,
  accessor,
  playerCount,
  maxLabel,
}: {
  title: string
  timeline: TimelineSample[]
  accessor: (s: TimelineSample) => number[]
  playerCount: number
  maxLabel?: number
}) {
  const duration = Math.max(timeline[timeline.length - 1].t, 1)
  const maxValue = Math.max(maxLabel ?? 1, ...timeline.flatMap(accessor))

  const x = (t: number) => PAD + (t / duration) * (W - 2 * PAD)
  const y = (v: number) => H - PAD - (v / maxValue) * (H - 2 * PAD)

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h4 className="text-xs uppercase tracking-wider text-slate-500">{title}</h4>
        <span className="text-[10px] tabular-nums text-slate-600">max {maxValue}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 w-full rounded-lg border border-white/5 bg-space-950/60"
        role="img"
        aria-label={title}
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + f * (H - 2 * PAD)}
            y2={PAD + f * (H - 2 * PAD)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        {Array.from({ length: playerCount }, (_, i) => (
          <polyline
            key={i}
            fill="none"
            stroke={ownerColor(i)}
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={timeline.map((s) => `${x(s.t)},${y(accessor(s)[i] ?? 0)}`).join(' ')}
          />
        ))}
      </svg>
    </div>
  )
}

export function MatchCharts({ result }: { result: MatchResult }) {
  const { timeline, config } = result
  if (timeline.length < 2) return null

  return (
    <div className="rounded-xl border border-white/10 bg-space-800/60 p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
        Match progress
      </h3>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {config.players.map((p) => (
          <span key={p.id} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: ownerColor(p.id) }}
            />
            {slotName(p.id, p.kind, p.difficulty)}
          </span>
        ))}
      </div>
      <div className="mt-3 space-y-4">
        <Chart
          title="Planets owned"
          timeline={timeline}
          accessor={(s) => s.planets}
          playerCount={config.players.length}
        />
        <Chart
          title="Total units"
          timeline={timeline}
          accessor={(s) => s.units}
          playerCount={config.players.length}
        />
      </div>
    </div>
  )
}
