import {
  MAX_PLANET_LEVEL,
  UPGRADE_CAP_BONUS,
  UPGRADE_COST,
  UPGRADE_RADIUS_MULT,
  UPGRADE_THRESHOLD,
} from '../constants'
import type { FleetParticle, MatchState } from '../types'
import { checkVictory } from './victory'

function resolveArrival(state: MatchState, particle: FleetParticle): void {
  const target = state.planets[particle.targetId]
  if (target.owner === particle.owner) {
    // reinforcing may push units above cap; regen simply stops there
    target.units += 1
    // deliberate investment upgrades the planet: units are consumed,
    // production doubles, capacity and radius grow
    if (target.level < MAX_PLANET_LEVEL && target.units >= UPGRADE_THRESHOLD) {
      target.units -= UPGRADE_COST
      target.level += 1
      target.regen *= 2
      target.cap += UPGRADE_CAP_BONUS
      target.radius *= UPGRADE_RADIUS_MULT
      state.effects.push({
        x: target.x,
        y: target.y,
        owner: target.owner,
        age: 0,
        kind: 'upgrade',
        radius: target.radius,
      })
    }
  } else {
    target.units -= 1
    if (target.units < 0) {
      target.owner = particle.owner
      target.units = -target.units
      state.effects.push({ x: target.x, y: target.y, owner: particle.owner, age: 0 })
    }
  }
}

export function stepSimulation(state: MatchState, dt: number): void {
  if (state.status !== 'running') return
  state.elapsed += dt

  for (const planet of state.planets) {
    if (planet.owner !== -1 && planet.units < planet.cap) {
      planet.units = Math.min(planet.cap, planet.units + planet.regen * dt)
    }
  }

  const survivors: FleetParticle[] = []
  for (const particle of state.particles) {
    let remaining = dt
    if (particle.delay > 0) {
      if (particle.delay >= remaining) {
        particle.delay -= remaining
        survivors.push(particle)
        continue
      }
      remaining -= particle.delay
      particle.delay = 0
    }
    particle.t += particle.speed * remaining
    if (particle.t >= 1) {
      resolveArrival(state, particle)
    } else {
      survivors.push(particle)
    }
  }
  state.particles = survivors

  for (const effect of state.effects) effect.age += dt
  state.effects = state.effects.filter((e) => e.age < 0.8)

  state.status = checkVictory(state)
}
