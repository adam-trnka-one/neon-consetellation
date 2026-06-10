import type { MapSize, PlanetSize } from './types'

// every planet produces 1 unit/s at level 1; size affects capacity & garrison
export const PLANET_STATS: Record<PlanetSize, { cap: number; regen: number; radius: number }> = {
  small: { cap: 20, regen: 1.0, radius: 16 },
  medium: { cap: 40, regen: 1.0, radius: 24 },
  large: { cap: 80, regen: 1.0, radius: 34 },
}

export const WORLD: Record<MapSize, { w: number; h: number; planets: number }> = {
  small: { w: 1200, h: 800, planets: 9 },
  medium: { w: 1600, h: 1000, planets: 14 },
  large: { w: 2000, h: 1250, planets: 20 },
}

// Reinforcing one of your own planets to the threshold upgrades it:
// the units are consumed, production doubles, and the planet grows.
export const UPGRADE_THRESHOLD = 30
export const UPGRADE_COST = 30
export const UPGRADE_CAP_BONUS = 30
export const UPGRADE_RADIUS_MULT = 1.22
export const MAX_PLANET_LEVEL = 2

// world units per second
export const FLEET_SPEED = 140
export const SEND_RATIO = 0.5
export const SIM_HZ = 30
export const SIM_DT = 1 / SIM_HZ
// seconds between particle departures within one send
export const PARTICLE_STAGGER = 0.04

export const NEUTRAL_UNITS: Record<PlanetSize, [number, number]> = {
  small: [4, 10],
  medium: [8, 18],
  large: [15, 30],
}
export const START_UNITS = 30

// weighted toward small planets
export const SIZE_WEIGHTS: Array<[PlanetSize, number]> = [
  ['small', 0.55],
  ['medium', 0.33],
  ['large', 0.12],
]
