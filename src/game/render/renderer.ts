import { SIM_DT } from '../constants'
import type { FleetParticle, MatchState } from '../types'
import type { Viewport } from '../engine/viewport'
import { drawSelectionRing, drawShockwave, drawTargetRing } from './effects'
import { BG_COLOR, ownerColor } from './palette'
import { drawGlow } from './sprites'
import { drawStarfield, type Starfield } from './starfield'

export interface RenderUi {
  selection: ReadonlySet<number>
  // world coordinates
  boxRect: { x1: number; y1: number; x2: number; y2: number } | null
  dragLine: { sx: number; sy: number; x: number; y: number } | null
  alpha: number
  time: number
}

export function particlePosition(p: FleetParticle, alpha: number): { x: number; y: number } {
  const t = Math.min(p.delay > 0 ? 0 : p.t + alpha * p.speed * SIM_DT, 1)
  const dx = p.tx - p.sx
  const dy = p.ty - p.sy
  const len = Math.hypot(dx, dy) || 1
  // perpendicular bow that fades in/out along the path
  const sway = Math.sin(Math.PI * t) * p.jitter
  return {
    x: p.sx + dx * t + (-dy / len) * sway,
    y: p.sy + dy * t + (dx / len) * sway,
  }
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: MatchState,
  viewport: Viewport,
  starfield: Starfield,
  ui: RenderUi,
): void {
  const { dpr, scale, offsetX, offsetY } = viewport

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, viewport.cssWidth, viewport.cssHeight)

  // world-space transform from here on
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, offsetX * dpr, offsetY * dpr)

  drawStarfield(ctx, starfield, ui.time, scale)

  // additive glow pass
  ctx.globalCompositeOperation = 'lighter'
  for (const planet of state.planets) {
    drawGlow(ctx, ownerColor(planet.owner), planet.x, planet.y, planet.radius * 2.2, 0.55)
    drawGlow(ctx, ownerColor(planet.owner), planet.x, planet.y, planet.radius * 1.15, 0.95)
  }
  for (const particle of state.particles) {
    if (particle.delay > 0) continue
    const color = ownerColor(particle.owner)
    const pos = particlePosition(particle, ui.alpha)
    drawGlow(ctx, color, pos.x, pos.y, 5, 0.9)
    // short fading trail
    for (let i = 1; i <= 2; i++) {
      const back = { ...particle, t: particle.t - i * 0.012 }
      if (back.t <= 0) break
      const bp = particlePosition(back, ui.alpha)
      drawGlow(ctx, color, bp.x, bp.y, 4 - i, 0.35 / i)
    }
  }
  ctx.globalCompositeOperation = 'source-over'

  // solid planet cores + unit counts
  for (const planet of state.planets) {
    ctx.fillStyle = '#0e0e2a'
    ctx.beginPath()
    ctx.arc(planet.x, planet.y, planet.radius * 0.72, 0, Math.PI * 2)
    ctx.fill()
    if (planet.level > 1) {
      // upgraded planets wear a thin ring in their owner's color
      ctx.strokeStyle = ownerColor(planet.owner)
      ctx.globalAlpha = 0.85
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(planet.x, planet.y, planet.radius * 0.85, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    ctx.fillStyle = '#f1f5f9'
    ctx.font = `600 ${Math.max(13, planet.radius * 0.62)}px "Space Grotesk", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(Math.floor(planet.units)), planet.x, planet.y)
  }

  // mark every planet the player's fleets are currently heading to
  const inboundTargets = new Set<number>()
  for (const particle of state.particles) {
    if (particle.owner === 0) inboundTargets.add(particle.targetId)
  }
  for (const id of inboundTargets) {
    const planet = state.planets[id]
    if (planet) drawTargetRing(ctx, planet.x, planet.y, planet.radius, ui.time)
  }

  for (const effect of state.effects) drawShockwave(ctx, effect)

  for (const id of ui.selection) {
    const planet = state.planets[id]
    if (planet) {
      drawSelectionRing(ctx, planet.x, planet.y, planet.radius, ui.time)
      // count badge
      const badgeY = planet.y - planet.radius - 16
      ctx.fillStyle = '#22d3ee'
      ctx.font = '700 13px "DM Sans", sans-serif'
      ctx.fillText(`▲ ${Math.floor(Math.floor(planet.units) / 2)}`, planet.x, badgeY)
    }
  }

  if (ui.dragLine) {
    ctx.strokeStyle = '#22d3ee'
    ctx.globalAlpha = 0.6
    ctx.lineWidth = 2
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.moveTo(ui.dragLine.sx, ui.dragLine.sy)
    ctx.lineTo(ui.dragLine.x, ui.dragLine.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }

  if (ui.boxRect) {
    const { x1, y1, x2, y2 } = ui.boxRect
    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)'
    ctx.lineWidth = 1.5
    const x = Math.min(x1, x2)
    const y = Math.min(y1, y2)
    const w = Math.abs(x2 - x1)
    const h = Math.abs(y2 - y1)
    ctx.fillRect(x, y, w, h)
    ctx.strokeRect(x, y, w, h)
  }
}
