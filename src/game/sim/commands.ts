import { FLEET_SPEED, PARTICLE_STAGGER, SEND_RATIO } from '../constants'
import type { Rng } from '../rng'
import type { MatchState, Owner } from '../types'

// Shared command path for human and AI: sends 50% of each source's units
// as a staggered particle stream toward the target.
export function issueSend(
  state: MatchState,
  sourceIds: number[],
  targetId: number,
  owner: Owner,
  rng: Rng,
): void {
  const target = state.planets[targetId]
  if (!target) return

  for (const sourceId of sourceIds) {
    if (sourceId === targetId) continue
    const source = state.planets[sourceId]
    if (!source || source.owner !== owner) continue

    const amount = Math.floor(Math.floor(source.units) * SEND_RATIO)
    if (amount < 1) continue
    source.units -= amount

    const dx = target.x - source.x
    const dy = target.y - source.y
    const dist = Math.hypot(dx, dy)
    const speed = FLEET_SPEED / Math.max(dist, 1)

    for (let i = 0; i < amount; i++) {
      state.particles.push({
        owner,
        sourceId,
        targetId,
        sx: source.x,
        sy: source.y,
        tx: target.x,
        ty: target.y,
        jitter: (rng() - 0.5) * source.radius * 1.2,
        t: 0,
        delay: i * PARTICLE_STAGGER,
        speed,
      })
    }
  }
}
