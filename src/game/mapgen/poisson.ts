import type { Rng } from '../rng'

export interface Point {
  x: number
  y: number
}

// Bridson's Poisson-disc sampling inside [margin, w-margin] x [margin, h-margin]
export function poissonDisc(
  rng: Rng,
  width: number,
  height: number,
  minDist: number,
  margin: number,
): Point[] {
  const k = 30
  const cell = minDist / Math.SQRT2
  const cols = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)
  const grid: Array<Point | null> = new Array(cols * rows).fill(null)
  const active: Point[] = []
  const points: Point[] = []

  const inBounds = (p: Point) =>
    p.x >= margin && p.x <= width - margin && p.y >= margin && p.y <= height - margin

  const gridIndex = (p: Point) =>
    Math.floor(p.y / cell) * cols + Math.floor(p.x / cell)

  const farEnough = (p: Point) => {
    const cx = Math.floor(p.x / cell)
    const cy = Math.floor(p.y / cell)
    for (let y = Math.max(0, cy - 2); y <= Math.min(rows - 1, cy + 2); y++) {
      for (let x = Math.max(0, cx - 2); x <= Math.min(cols - 1, cx + 2); x++) {
        const q = grid[y * cols + x]
        if (q) {
          const dx = q.x - p.x
          const dy = q.y - p.y
          if (dx * dx + dy * dy < minDist * minDist) return false
        }
      }
    }
    return true
  }

  const add = (p: Point) => {
    grid[gridIndex(p)] = p
    active.push(p)
    points.push(p)
  }

  add({
    x: margin + rng() * (width - 2 * margin),
    y: margin + rng() * (height - 2 * margin),
  })

  while (active.length > 0) {
    const idx = Math.floor(rng() * active.length)
    const base = active[idx]
    let placed = false
    for (let i = 0; i < k; i++) {
      const angle = rng() * Math.PI * 2
      const dist = minDist * (1 + rng())
      const p = { x: base.x + Math.cos(angle) * dist, y: base.y + Math.sin(angle) * dist }
      if (inBounds(p) && farEnough(p)) {
        add(p)
        placed = true
        break
      }
    }
    if (!placed) active.splice(idx, 1)
  }

  return points
}
