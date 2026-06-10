export type Owner = number // -1 neutral, 0 human, 1..3 AI

export type PlanetSize = 'small' | 'medium' | 'large'
export type MapSize = 'small' | 'medium' | 'large'
export type AiDifficulty = 'easy' | 'normal' | 'hard'

export interface PlayerSlot {
  id: Owner
  kind: 'human' | 'ai'
  difficulty?: AiDifficulty
}

export interface MatchConfig {
  seed: string
  mapSize: MapSize
  players: PlayerSlot[] // length 2..4, slot 0 is the human
}

export interface Planet {
  id: number
  x: number
  y: number
  size: PlanetSize
  radius: number
  owner: Owner
  units: number
  cap: number
  regen: number
}

export interface FleetParticle {
  owner: Owner
  sourceId: number
  targetId: number
  sx: number
  sy: number
  tx: number
  ty: number
  // perpendicular jitter (world units), cosmetic only
  jitter: number
  // progress 0..1 along the path; advances once delay elapses
  t: number
  delay: number
  // progress per second (FLEET_SPEED / path length)
  speed: number
}

export interface Shockwave {
  x: number
  y: number
  owner: Owner
  age: number
}

export type MatchStatus = 'running' | 'paused' | 'won' | 'lost'

export interface MatchState {
  config: MatchConfig
  planets: Planet[]
  particles: FleetParticle[]
  effects: Shockwave[]
  elapsed: number
  status: MatchStatus
}

export interface PlayerBreakdown {
  slot: Owner
  kind: 'human' | 'ai'
  difficulty?: AiDifficulty
  planets: number
  units: number
  fleets: number
}

export interface MatchResult {
  won: boolean
  durationS: number
  breakdown: PlayerBreakdown[]
  config: MatchConfig
}
