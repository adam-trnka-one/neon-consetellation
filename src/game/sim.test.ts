import { describe, expect, it } from 'vitest'
import { SIM_DT } from './constants'
import { createRng } from './rng'
import { issueSend } from './sim/commands'
import { createMatch } from './sim/createMatch'
import { stepSimulation } from './sim/step'
import type { MatchConfig, MatchState } from './types'

const config: MatchConfig = {
  seed: 'TEST42',
  mapSize: 'small',
  players: [
    { id: 0, kind: 'human' },
    { id: 1, kind: 'ai', difficulty: 'normal' },
  ],
}

function hash(state: MatchState): string {
  return state.planets
    .map((p) => `${p.id}:${p.owner}:${p.units.toFixed(4)}:${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join('|')
}

describe('map generation', () => {
  it('is deterministic for the same seed', () => {
    const a = createMatch(config)
    const b = createMatch(config)
    expect(hash(a)).toBe(hash(b))
  })

  it('differs for different seeds', () => {
    const a = createMatch(config)
    const b = createMatch({ ...config, seed: 'OTHER' })
    expect(hash(a)).not.toBe(hash(b))
  })

  it('gives each player one large starting planet', () => {
    const state = createMatch(config)
    for (const player of config.players) {
      const starts = state.planets.filter((p) => p.owner === player.id)
      expect(starts).toHaveLength(1)
      expect(starts[0].size).toBe('large')
    }
    expect(state.planets).toHaveLength(12)
  })
})

describe('simulation', () => {
  it('is deterministic over many steps with sends', () => {
    const run = () => {
      const state = createMatch(config)
      const rng = createRng('fx')
      const source = state.planets.find((p) => p.owner === 0)!
      const target = state.planets.find((p) => p.owner === -1)!
      issueSend(state, [source.id], target.id, 0, rng)
      for (let i = 0; i < 600; i++) stepSimulation(state, SIM_DT)
      return hash(state)
    }
    expect(run()).toBe(run())
  })

  it('regenerates owned planets up to cap but not neutrals', () => {
    const state = createMatch(config)
    const owned = state.planets.find((p) => p.owner === 0)!
    const neutral = state.planets.find((p) => p.owner === -1)!
    const ownedBefore = owned.units
    const neutralBefore = neutral.units
    for (let i = 0; i < 30; i++) stepSimulation(state, SIM_DT)
    expect(owned.units).toBeGreaterThan(ownedBefore)
    expect(neutral.units).toBe(neutralBefore)
    for (let i = 0; i < 30 * 300; i++) stepSimulation(state, SIM_DT)
    expect(owned.units).toBeLessThanOrEqual(owned.cap)
  })

  it('sends half the source units and captures with leftover', () => {
    const state = createMatch(config)
    const source = state.planets.find((p) => p.owner === 0)!
    const target = state.planets.find((p) => p.owner === -1)!
    source.units = 40
    target.units = 5
    const rng = createRng('fx')
    issueSend(state, [source.id], target.id, 0, rng)
    expect(source.units).toBe(20)
    expect(state.particles).toHaveLength(20)
    // run long enough for every particle to arrive
    for (let i = 0; i < 30 * 60 && state.particles.length > 0; i++) {
      stepSimulation(state, SIM_DT)
    }
    expect(target.owner).toBe(0)
    // 20 attackers vs 5 defenders (no neutral regen): captured planet keeps
    // ~14 units (one unit consumed flipping past zero) before regen kicks in
    expect(target.units).toBeGreaterThan(10)
    expect(target.units).toBeLessThanOrEqual(20)
  })

  it('reinforces same-owner targets', () => {
    const state = createMatch(config)
    const source = state.planets.find((p) => p.owner === 0)!
    const target = state.planets.find((p) => p.owner === -1)!
    target.owner = 0
    target.units = 0
    source.units = 10
    issueSend(state, [source.id], target.id, 0, createRng('fx'))
    for (let i = 0; i < 30 * 60 && state.particles.length > 0; i++) {
      stepSimulation(state, SIM_DT)
    }
    expect(target.owner).toBe(0)
    expect(target.units).toBeGreaterThanOrEqual(5)
  })

  it('detects victory when human owns everything and no enemy fleets fly', () => {
    const state = createMatch(config)
    for (const p of state.planets) p.owner = 0
    stepSimulation(state, SIM_DT)
    expect(state.status).toBe('won')
  })

  it('detects defeat when human has no planets and no fleets', () => {
    const state = createMatch(config)
    for (const p of state.planets) {
      if (p.owner === 0) p.owner = 1
    }
    stepSimulation(state, SIM_DT)
    expect(state.status).toBe('lost')
  })
})
