import { createAiControllers, runAi, type AiController } from '../ai/aiController'
import { SIM_DT, WORLD } from '../constants'
import { render } from '../render/renderer'
import { createStarfield, type Starfield } from '../render/starfield'
import { createRng, type Rng } from '../rng'
import { issueSend } from '../sim/commands'
import { createMatch } from '../sim/createMatch'
import { stepSimulation } from '../sim/step'
import type { MatchConfig, MatchResult, MatchState, MatchStatus, Planet } from '../types'
import { InputController } from './input'
import { Viewport } from './viewport'

export interface HudSnapshot {
  planetsOwned: number
  totalPlanets: number
  units: number
  elapsed: number
  status: MatchStatus
}

const HUD_PUBLISH_INTERVAL = 0.2

export class GameEngine {
  readonly state: MatchState
  readonly viewport: Viewport

  onMatchEnd?: (result: MatchResult) => void

  private ctx: CanvasRenderingContext2D
  private input: InputController
  private starfield: Starfield
  private ai: AiController[]
  private fxRng: Rng
  private selection = new Set<number>()

  private raf = 0
  private last = 0
  private accumulator = 0
  private ended = false

  private hudListeners = new Set<() => void>()
  private hudSnapshot: HudSnapshot
  private sinceHudPublish = Infinity

  private resizeObserver: ResizeObserver

  constructor(canvas: HTMLCanvasElement, config: MatchConfig) {
    this.state = createMatch(config)
    const world = WORLD[config.mapSize]
    // Maps are generated landscape; on portrait screens rotate the world 90°
    // (transpose coordinates) so the same map fills the tall viewport instead
    // of shrinking into a letterboxed band. Seed reproducibility is preserved.
    const portrait = canvas.clientHeight > canvas.clientWidth
    const worldW = portrait ? world.h : world.w
    const worldH = portrait ? world.w : world.h
    if (portrait) {
      for (const planet of this.state.planets) {
        const x = planet.x
        planet.x = planet.y
        planet.y = x
      }
    }
    this.viewport = new Viewport(worldW, worldH)
    this.ctx = canvas.getContext('2d')!
    this.starfield = createStarfield(config.seed, worldW, worldH)
    this.ai = createAiControllers(this.state)
    this.fxRng = createRng(`${config.seed}:fx`)
    this.hudSnapshot = this.buildHudSnapshot()

    this.input = new InputController(canvas, {
      screenToWorld: (x, y) => this.viewport.screenToWorld(x, y),
      hitTest: (x, y, inflate) => this.hitTest(x, y, inflate),
      getSelection: () => this.selection,
      setSelection: (ids) => {
        this.selection = new Set(ids)
      },
      send: (sourceIds, targetId) => this.send(sourceIds, targetId),
      isHumanPlanet: (planet) => planet.owner === 0,
    })
    this.input.setBoxSelector((x1, y1, x2, y2) =>
      this.state.planets
        .filter((p) => p.owner === 0 && p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2)
        .map((p) => p.id),
    )

    this.resizeObserver = new ResizeObserver(() => this.viewport.resize(canvas))
    this.resizeObserver.observe(canvas)
    this.viewport.resize(canvas)
  }

  start(): void {
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  destroy(): void {
    cancelAnimationFrame(this.raf)
    this.resizeObserver.disconnect()
    this.input.destroy()
    this.hudListeners.clear()
  }

  togglePause(): void {
    if (this.state.status === 'running') this.state.status = 'paused'
    else if (this.state.status === 'paused') this.state.status = 'running'
    this.publishHud()
  }

  // --- HUD store (useSyncExternalStore contract) ---

  subscribe = (listener: () => void): (() => void) => {
    this.hudListeners.add(listener)
    return () => this.hudListeners.delete(listener)
  }

  getHudSnapshot = (): HudSnapshot => this.hudSnapshot

  // --- internals ---

  private frame = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.1)
    this.last = now

    if (this.state.status === 'running') {
      this.accumulator += dt
      while (this.accumulator >= SIM_DT) {
        stepSimulation(this.state, SIM_DT)
        runAi(this.state, this.ai)
        this.accumulator -= SIM_DT
      }
      // drop selections of planets lost to the enemy
      for (const id of this.selection) {
        if (this.state.planets[id]?.owner !== 0) this.selection.delete(id)
      }
    }

    if (!this.ended && (this.state.status === 'won' || this.state.status === 'lost')) {
      this.ended = true
      this.publishHud()
      this.onMatchEnd?.(this.buildResult())
    }

    render(this.ctx, this.state, this.viewport, this.starfield, {
      selection: this.selection,
      boxRect: this.input.boxRect,
      dragLine: this.input.dragLine,
      alpha: this.accumulator / SIM_DT,
      time: this.state.elapsed,
    })

    this.sinceHudPublish += dt
    if (this.sinceHudPublish >= HUD_PUBLISH_INTERVAL) this.publishHud()

    this.raf = requestAnimationFrame(this.frame)
  }

  private send(sourceIds: number[], targetId: number): void {
    if (this.state.status !== 'running') return
    issueSend(this.state, sourceIds, targetId, 0, this.fxRng)
  }

  private hitTest(worldX: number, worldY: number, inflatePx: number): Planet | null {
    const inflate = inflatePx / Math.max(this.viewport.scale, 0.001)
    let best: Planet | null = null
    let bestDist = Infinity
    for (const planet of this.state.planets) {
      const d = Math.hypot(planet.x - worldX, planet.y - worldY)
      if (d <= planet.radius + inflate && d < bestDist) {
        best = planet
        bestDist = d
      }
    }
    return best
  }

  private buildHudSnapshot(): HudSnapshot {
    let planetsOwned = 0
    let units = 0
    for (const planet of this.state.planets) {
      if (planet.owner === 0) {
        planetsOwned++
        units += Math.floor(planet.units)
      }
    }
    for (const particle of this.state.particles) {
      if (particle.owner === 0) units++
    }
    return {
      planetsOwned,
      totalPlanets: this.state.planets.length,
      units,
      elapsed: this.state.elapsed,
      status: this.state.status,
    }
  }

  private publishHud(): void {
    this.sinceHudPublish = 0
    this.hudSnapshot = this.buildHudSnapshot()
    for (const listener of this.hudListeners) listener()
  }

  private buildResult(): MatchResult {
    const breakdown = this.state.config.players.map((slot) => {
      let planets = 0
      let units = 0
      let fleets = 0
      for (const planet of this.state.planets) {
        if (planet.owner === slot.id) {
          planets++
          units += Math.floor(planet.units)
        }
      }
      for (const particle of this.state.particles) {
        if (particle.owner === slot.id) fleets++
      }
      return { slot: slot.id, kind: slot.kind, difficulty: slot.difficulty, planets, units, fleets }
    })
    return {
      won: this.state.status === 'won',
      durationS: Math.round(this.state.elapsed),
      breakdown,
      config: this.state.config,
    }
  }
}
