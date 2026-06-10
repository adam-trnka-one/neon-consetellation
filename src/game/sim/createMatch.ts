import { createRng } from '../rng'
import { generateMap } from '../mapgen/generateMap'
import type { MatchConfig, MatchState } from '../types'

export function createMatch(config: MatchConfig): MatchState {
  const rng = createRng(config.seed)
  return {
    config,
    planets: generateMap(config, rng),
    particles: [],
    effects: [],
    elapsed: 0,
    status: 'running',
  }
}
