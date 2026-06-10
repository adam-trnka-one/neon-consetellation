import type { Shockwave } from '../types'
import { ownerColor } from './palette'

const SHOCKWAVE_LIFE = 0.8
const PING_LIFE = 0.5

export function drawShockwave(ctx: CanvasRenderingContext2D, effect: Shockwave): void {
  if (effect.kind === 'ping') {
    // contracting ring that collapses onto the send target
    const progress = Math.min(effect.age / PING_LIFE, 1)
    const base = effect.radius ?? 20
    const radius = base * (2.6 - progress * 1.5)
    ctx.strokeStyle = ownerColor(effect.owner)
    ctx.globalAlpha = (1 - progress) * 0.9
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
    return
  }
  if (effect.kind === 'upgrade') {
    // celebratory double ring expanding from the leveled-up planet
    const progress = Math.min(effect.age / SHOCKWAVE_LIFE, 1)
    const base = effect.radius ?? 24
    ctx.strokeStyle = ownerColor(effect.owner)
    ctx.globalAlpha = (1 - progress) * 0.9
    ctx.lineWidth = 2.5
    for (const lag of [0, 0.18]) {
      const p = Math.max(progress - lag, 0)
      ctx.beginPath()
      ctx.arc(effect.x, effect.y, base * (1 + p * 1.6), 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    return
  }
  const progress = Math.min(effect.age / SHOCKWAVE_LIFE, 1)
  const radius = 20 + progress * 90
  ctx.strokeStyle = ownerColor(effect.owner)
  ctx.globalAlpha = (1 - progress) * 0.8
  ctx.lineWidth = 3 * (1 - progress) + 0.5
  ctx.beginPath()
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
}

// Pulsing marker on planets that have the player's units inbound,
// so it's always visible where fleets are headed.
export function drawTargetRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
): void {
  ctx.strokeStyle = '#22d3ee'
  ctx.globalAlpha = 0.45 + 0.25 * Math.sin(time * 6)
  ctx.lineWidth = 2
  ctx.setLineDash([4, 7])
  ctx.lineDashOffset = time * 26
  ctx.beginPath()
  ctx.arc(x, y, radius + 9, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

export function drawSelectionRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
): void {
  ctx.strokeStyle = '#ffffff'
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 2
  ctx.setLineDash([6, 6])
  ctx.lineDashOffset = -time * 20
  ctx.beginPath()
  ctx.arc(x, y, radius + 7, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}
