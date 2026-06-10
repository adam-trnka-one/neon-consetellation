import type { MatchConfig, MatchResult } from './types'

const MAP_MULT = { small: 1.0, medium: 1.5, large: 2.2 } as const
const DIFF_VALUE = { easy: 1, normal: 2, hard: 3 } as const

// Faster wins on bigger maps against harder AIs score higher; losses score 0.
export function computeScore(result: MatchResult, config: MatchConfig): number {
  if (!result.won) return 0
  const base = Math.max(2000, 20000 - result.durationS * 12)
  const diffSum = config.players
    .filter((p) => p.kind === 'ai')
    .reduce((sum, p) => sum + DIFF_VALUE[p.difficulty ?? 'normal'], 0)
  const diffMult = 1 + 0.35 * diffSum
  return Math.round(base * MAP_MULT[config.mapSize] * diffMult)
}
