import type { Shockwave } from '../types'
import { ownerColor } from './palette'

const SHOCKWAVE_LIFE = 0.8

export function drawShockwave(ctx: CanvasRenderingContext2D, effect: Shockwave): void {
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
