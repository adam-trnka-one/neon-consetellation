import type { MatchState, MatchStatus } from '../types'

export function checkVictory(state: MatchState): MatchStatus {
  const humanHasPlanet = state.planets.some((p) => p.owner === 0)
  const humanHasFleet = state.particles.some((p) => p.owner === 0)
  if (!humanHasPlanet && !humanHasFleet) return 'lost'

  const ownsEverything = state.planets.every((p) => p.owner === 0)
  const enemyFleetInFlight = state.particles.some((p) => p.owner !== 0)
  if (ownsEverything && !enemyFleetInFlight) return 'won'

  return state.status
}
