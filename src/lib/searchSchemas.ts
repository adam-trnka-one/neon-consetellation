import { z } from 'zod'
import type { MatchConfig } from '../game/types'

export const matchSearchSchema = z.object({
  seed: z.string().min(1).max(32).catch('NEON42'),
  map: z.enum(['small', 'medium', 'large']).catch('medium'),
  ai: z.array(z.enum(['easy', 'normal', 'hard'])).min(1).max(3).catch(['normal']),
})

export type MatchSearch = z.infer<typeof matchSearchSchema>

export function matchSearchToConfig(search: MatchSearch): MatchConfig {
  return {
    seed: search.seed,
    mapSize: search.map,
    players: [
      { id: 0, kind: 'human' },
      ...search.ai.map((difficulty, i) => ({
        id: i + 1,
        kind: 'ai' as const,
        difficulty,
      })),
    ],
  }
}

export const leaderboardSearchSchema = z.object({
  tab: z.enum(['single', 'multi']).catch('single'),
  q: z.string().trim().min(1).max(24).optional().catch(undefined),
  page: z.number().int().min(1).catch(1),
  player: z.uuid().optional().catch(undefined),
})

export type LeaderboardSearch = z.infer<typeof leaderboardSearchSchema>
