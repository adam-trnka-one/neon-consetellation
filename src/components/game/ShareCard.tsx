import { useState } from 'react'
import { ownerColor, OWNER_NAMES } from '../../game/render/palette'
import type { MatchResult } from '../../game/types'
import { Button } from '../ui/Button'

function slotName(slot: number, kind: string, difficulty?: string): string {
  if (kind === 'human') return 'You'
  return `${OWNER_NAMES[slot]} AI (${difficulty ?? 'normal'})`
}

export function ShareCard({ result, score }: { result: MatchResult; score: number }) {
  const [copied, setCopied] = useState(false)
  const sorted = [...result.breakdown].sort((a, b) => b.planets - a.planets || b.units - a.units)

  const shareText = [
    `Neon Space — I ${result.won ? 'won' : 'lost'} in ${result.durationS}s on a ${result.config.mapSize} map (seed ${result.config.seed})${score > 0 ? ` — score ${score}` : ''}`,
    ...sorted.map(
      (p) =>
        `${slotName(p.slot, p.kind, p.difficulty)}: ${p.planets} planets, ${p.units} units, ${p.fleets} fleets`,
    ),
  ].join('\n')

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Neon Space', text: shareText })
        return
      }
    } catch {
      // fall through to clipboard
    }
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-space-800/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-400">
          Final standings
        </h3>
        <Button variant="ghost" onClick={share} className="!px-3 !py-1.5 text-xs">
          {copied ? 'Copied!' : 'Share'}
        </Button>
      </div>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="pb-2 font-medium">Player</th>
            <th className="pb-2 text-right font-medium">Planets</th>
            <th className="pb-2 text-right font-medium">Units</th>
            <th className="pb-2 text-right font-medium">Fleets</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.slot} className="border-t border-white/5">
              <td className="py-2">
                <span
                  className="mr-2 inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: ownerColor(p.slot), boxShadow: `0 0 8px ${ownerColor(p.slot)}` }}
                />
                <span className={p.kind === 'human' ? 'text-slate-100' : 'text-slate-300'}>
                  {slotName(p.slot, p.kind, p.difficulty)}
                </span>
              </td>
              <td className="py-2 text-right tabular-nums text-slate-300">{p.planets}</td>
              <td className="py-2 text-right tabular-nums text-slate-300">{p.units}</td>
              <td className="py-2 text-right tabular-nums text-slate-300">{p.fleets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
