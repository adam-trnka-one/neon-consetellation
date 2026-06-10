import { FLEET_SPEED, SEND_RATIO } from '../constants'
import { createRng, type Rng } from '../rng'
import { issueSend } from '../sim/commands'
import type { AiDifficulty, MatchState, Owner, Planet } from '../types'

const TUNING: Record<AiDifficulty, { tick: number; aggression: number; threshold: number }> = {
  easy: { tick: 3.5, aggression: 0.7, threshold: 5 },
  normal: { tick: 2.2, aggression: 1.0, threshold: 3 },
  hard: { tick: 1.2, aggression: 1.4, threshold: 2 },
}

export interface AiController {
  owner: Owner
  difficulty: AiDifficulty
  nextTick: number
  rng: Rng
}

export function createAiControllers(state: MatchState): AiController[] {
  return state.config.players
    .filter((p) => p.kind === 'ai')
    .map((p, i) => ({
      owner: p.id,
      difficulty: p.difficulty ?? 'normal',
      // staggered first ticks so AIs don't move in lockstep
      nextTick: 1.5 + i * 0.7,
      rng: createRng(`${state.config.seed}:ai:${p.id}`),
    }))
}

function inboundUnits(state: MatchState, targetId: number, owner: Owner): number {
  let n = 0
  for (const p of state.particles) {
    if (p.targetId === targetId && p.owner === owner) n++
  }
  return n
}

function dist(a: Planet, b: Planet): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function actAttack(state: MatchState, ai: AiController): void {
  const { aggression, threshold } = TUNING[ai.difficulty]
  const mine = state.planets.filter((p) => p.owner === ai.owner && Math.floor(p.units) >= 8)
  if (mine.length === 0) return

  let best: { source: Planet; target: Planet; score: number } | null = null
  for (const source of mine) {
    const send = Math.floor(Math.floor(source.units) * SEND_RATIO)
    for (const target of state.planets) {
      if (target.owner === ai.owner) continue
      const travelTime = dist(source, target) / FLEET_SPEED
      const defense =
        target.units +
        (target.owner !== -1 ? inboundUnits(state, target.id, target.owner) : 0) +
        (target.owner !== -1 ? target.regen * travelTime : 0) -
        inboundUnits(state, target.id, ai.owner)
      // favor cheap neutral expansion early, switch to enemies later
      const bias = target.owner === -1 ? (state.elapsed < 90 ? 1.25 : 0.9) : 1.0
      const score = (send - defense) * bias * aggression - travelTime * 1.5
      if (score > threshold && (!best || score > best.score)) {
        best = { source, target, score }
      }
    }
  }
  if (best) {
    issueSend(state, [best.source.id], best.target.id, ai.owner, ai.rng)
  }
}

// Hard AI: ship units from safe rear planets to weak frontier planets.
function actDefend(state: MatchState, ai: AiController): void {
  const mine = state.planets.filter((p) => p.owner === ai.owner)
  const hostile = state.planets.filter((p) => p.owner !== ai.owner && p.owner !== -1)
  if (mine.length < 2 || hostile.length === 0) return

  const threat = (p: Planet) => Math.min(...hostile.map((h) => dist(p, h)))
  const sorted = mine.map((p) => ({ p, threat: threat(p) })).sort((a, b) => a.threat - b.threat)
  const median = sorted[Math.floor(sorted.length / 2)].threat

  const frontier = sorted.find(
    ({ p, threat: t }) => t < median && p.units < p.cap * 0.4,
  )?.p
  if (!frontier) return

  const donor = sorted
    .slice()
    .reverse()
    .find(({ p, threat: t }) => t >= median && p.id !== frontier.id && p.units > p.cap * 0.7)?.p
  if (donor) {
    issueSend(state, [donor.id], frontier.id, ai.owner, ai.rng)
  }
}

export function runAi(state: MatchState, controllers: AiController[]): void {
  for (const ai of controllers) {
    if (state.elapsed < ai.nextTick) continue
    const { tick } = TUNING[ai.difficulty]
    ai.nextTick = state.elapsed + tick * (0.85 + ai.rng() * 0.3)

    const alive = state.planets.some((p) => p.owner === ai.owner)
    if (!alive) continue

    if (ai.difficulty === 'hard') actDefend(state, ai)
    actAttack(state, ai)
  }
}
