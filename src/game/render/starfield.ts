import { createRng } from '../rng'

interface Star {
  x: number
  y: number
  r: number
  a: number
}

export interface Starfield {
  near: Star[]
  far: Star[]
}

export function createStarfield(seed: string, worldW: number, worldH: number): Starfield {
  const rng = createRng(`${seed}:stars`)
  const make = (count: number, maxR: number): Star[] =>
    Array.from({ length: count }, () => ({
      // overscan so parallax drift never exposes an edge
      x: rng() * worldW * 1.2 - worldW * 0.1,
      y: rng() * worldH * 1.2 - worldH * 0.1,
      r: 0.5 + rng() * maxR,
      a: 0.15 + rng() * 0.5,
    }))
  return {
    far: make(Math.round((worldW * worldH) / 12000), 0.8),
    near: make(Math.round((worldW * worldH) / 30000), 1.4),
  }
}

export function drawStarfield(
  ctx: CanvasRenderingContext2D,
  field: Starfield,
  time: number,
  scale: number,
): void {
  ctx.fillStyle = '#cbd5e1'
  const layers: Array<[Star[], number]> = [
    [field.far, 2],
    [field.near, 5],
  ]
  for (const [stars, drift] of layers) {
    const ox = Math.sin(time * 0.03) * drift
    const oy = Math.cos(time * 0.021) * drift
    for (const star of stars) {
      ctx.globalAlpha = star.a
      ctx.beginPath()
      ctx.arc(star.x + ox, star.y + oy, star.r / Math.max(scale, 0.4), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}
