import { NEUTRAL_UNITS, PLANET_STATS, SIZE_WEIGHTS, START_UNITS, WORLD } from '../constants'
import type { Rng } from '../rng'
import { randInt, shuffle } from '../rng'
import type { MatchConfig, Planet, PlanetSize } from '../types'
import { poissonDisc, type Point } from './poisson'

function pickSize(rng: Rng): PlanetSize {
  let r = rng()
  for (const [size, weight] of SIZE_WEIGHTS) {
    if (r < weight) return size
    r -= weight
  }
  return 'small'
}

// Greedy farthest-point seeding so player starts are spread out.
function pickStartIndices(points: Point[], count: number, rng: Rng): number[] {
  const starts: number[] = [Math.floor(rng() * points.length)]
  while (starts.length < count) {
    let bestIdx = -1
    let bestDist = -1
    for (let i = 0; i < points.length; i++) {
      if (starts.includes(i)) continue
      let nearest = Infinity
      for (const s of starts) {
        const dx = points[i].x - points[s].x
        const dy = points[i].y - points[s].y
        nearest = Math.min(nearest, dx * dx + dy * dy)
      }
      if (nearest > bestDist) {
        bestDist = nearest
        bestIdx = i
      }
    }
    starts.push(bestIdx)
  }
  return starts
}

export function generateMap(config: MatchConfig, rng: Rng): Planet[] {
  const { w, h, planets: targetCount } = WORLD[config.mapSize]

  // Spacing scales with available area; retries shrink it if sampling under-delivers.
  let minDist = Math.max(110, Math.sqrt((w * h) / targetCount) * 0.62)
  let points: Point[] = []
  for (let attempt = 0; attempt < 6; attempt++) {
    points = poissonDisc(rng, w, h, minDist, PLANET_STATS.large.radius + 16)
    if (points.length >= targetCount) break
    minDist *= 0.85
  }
  points = shuffle(rng, points).slice(0, targetCount)

  const startIndices = pickStartIndices(points, config.players.length, rng)

  return points.map((p, i): Planet => {
    const startSlot = startIndices.indexOf(i)
    const isStart = startSlot !== -1
    const size: PlanetSize = isStart ? 'large' : pickSize(rng)
    const stats = PLANET_STATS[size]
    const [lo, hi] = NEUTRAL_UNITS[size]
    return {
      id: i,
      x: p.x,
      y: p.y,
      size,
      radius: stats.radius,
      owner: isStart ? config.players[startSlot].id : -1,
      units: isStart ? START_UNITS : randInt(rng, lo, hi),
      cap: stats.cap,
      regen: stats.regen,
    }
  })
}
