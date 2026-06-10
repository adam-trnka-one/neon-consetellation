import type { Planet } from '../types'

export interface InputDelegate {
  screenToWorld(x: number, y: number): { x: number; y: number }
  hitTest(worldX: number, worldY: number, inflate: number): Planet | null
  getSelection(): Set<number>
  setSelection(ids: number[]): void
  send(sourceIds: number[], targetId: number): void
  isHumanPlanet(planet: Planet): boolean
}

const DRAG_THRESHOLD_PX = 8
const LONG_PRESS_MS = 350
const TOUCH_HIT_INFLATE = 12

type Mode = 'idle' | 'pending' | 'box' | 'dragSend'

// Pointer-event state machine handling tap-select, shift/ctrl multi-select,
// drag-box (mouse on empty space, long-press on touch), drag-to-send, and
// tap-target launching for both desktop and touch.
export class InputController {
  boxRect: { x1: number; y1: number; x2: number; y2: number } | null = null
  dragLine: { sx: number; sy: number; x: number; y: number } | null = null

  private mode: Mode = 'idle'
  private downX = 0
  private downY = 0
  private downPlanet: Planet | null = null
  private isTouch = false
  private longPressTimer = 0

  constructor(
    private canvas: HTMLCanvasElement,
    private delegate: InputDelegate,
  ) {
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onCancel)
    window.addEventListener('keydown', this.onKey)
  }

  destroy(): void {
    clearTimeout(this.longPressTimer)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointercancel', this.onCancel)
    window.removeEventListener('keydown', this.onKey)
  }

  private canvasPos(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  private hitInflate(): number {
    return this.isTouch ? TOUCH_HIT_INFLATE : 0
  }

  private onDown = (e: PointerEvent) => {
    if (!e.isPrimary) return
    e.preventDefault()
    this.canvas.setPointerCapture(e.pointerId)
    this.isTouch = e.pointerType === 'touch'
    const pos = this.canvasPos(e)
    this.downX = pos.x
    this.downY = pos.y
    const world = this.delegate.screenToWorld(pos.x, pos.y)
    this.downPlanet = this.delegate.hitTest(world.x, world.y, this.hitInflate())
    this.mode = 'pending'

    if (this.isTouch) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = window.setTimeout(() => {
        if (this.mode === 'pending') this.enterBoxMode()
      }, LONG_PRESS_MS)
    }
  }

  private enterBoxMode(): void {
    this.mode = 'box'
    const start = this.delegate.screenToWorld(this.downX, this.downY)
    this.boxRect = { x1: start.x, y1: start.y, x2: start.x, y2: start.y }
  }

  private onMove = (e: PointerEvent) => {
    if (this.mode === 'idle') return
    const pos = this.canvasPos(e)
    const world = this.delegate.screenToWorld(pos.x, pos.y)

    if (this.mode === 'pending') {
      const moved = Math.hypot(pos.x - this.downX, pos.y - this.downY) > DRAG_THRESHOLD_PX
      if (!moved) return
      clearTimeout(this.longPressTimer)
      if (this.downPlanet && this.delegate.isHumanPlanet(this.downPlanet)) {
        this.mode = 'dragSend'
      } else if (!this.isTouch && !this.downPlanet) {
        this.enterBoxMode()
      } else {
        // touch pan/swipe with no gesture meaning: swallow it
        this.mode = 'idle'
        this.downPlanet = null
      }
    }

    if (this.mode === 'box' && this.boxRect) {
      this.boxRect.x2 = world.x
      this.boxRect.y2 = world.y
    }
    if (this.mode === 'dragSend' && this.downPlanet) {
      this.dragLine = { sx: this.downPlanet.x, sy: this.downPlanet.y, x: world.x, y: world.y }
    }
  }

  private onUp = (e: PointerEvent) => {
    if (!e.isPrimary) return
    clearTimeout(this.longPressTimer)
    const pos = this.canvasPos(e)
    const world = this.delegate.screenToWorld(pos.x, pos.y)
    const mode = this.mode
    this.mode = 'idle'

    if (mode === 'box') {
      this.finishBox(e.shiftKey)
      return
    }
    if (mode === 'dragSend') {
      this.dragLine = null
      const target = this.delegate.hitTest(world.x, world.y, this.hitInflate())
      const source = this.downPlanet
      if (source && target && target.id !== source.id) {
        const selection = this.delegate.getSelection()
        const sources = selection.has(source.id) ? [...selection] : [source.id]
        this.delegate.send(sources, target.id)
      }
      return
    }
    if (mode === 'pending') {
      this.handleTap(world.x, world.y, e.shiftKey || e.ctrlKey || e.metaKey)
    }
  }

  private onCancel = () => {
    clearTimeout(this.longPressTimer)
    this.mode = 'idle'
    this.boxRect = null
    this.dragLine = null
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.delegate.setSelection([])
  }

  private finishBox(additive: boolean): void {
    const rect = this.boxRect
    this.boxRect = null
    if (!rect) return
    const x1 = Math.min(rect.x1, rect.x2)
    const x2 = Math.max(rect.x1, rect.x2)
    const y1 = Math.min(rect.y1, rect.y2)
    const y2 = Math.max(rect.y1, rect.y2)
    const base = additive ? [...this.delegate.getSelection()] : []
    this.delegate.setSelection([...new Set([...base, ...this.boxSelect(x1, y1, x2, y2)])])
  }

  // populated by the engine via setBoxSelector — avoids widening the delegate
  private boxSelector: ((x1: number, y1: number, x2: number, y2: number) => number[]) | null = null

  setBoxSelector(fn: (x1: number, y1: number, x2: number, y2: number) => number[]): void {
    this.boxSelector = fn
  }

  private boxSelect(x1: number, y1: number, x2: number, y2: number): number[] {
    return this.boxSelector ? this.boxSelector(x1, y1, x2, y2) : []
  }

  private handleTap(worldX: number, worldY: number, additive: boolean): void {
    const planet = this.delegate.hitTest(worldX, worldY, this.hitInflate())
    const selection = this.delegate.getSelection()

    if (!planet) {
      this.delegate.setSelection([])
      return
    }

    if (this.delegate.isHumanPlanet(planet)) {
      if (additive) {
        const next = new Set(selection)
        if (next.has(planet.id)) next.delete(planet.id)
        else next.add(planet.id)
        this.delegate.setSelection([...next])
        return
      }
      if (selection.size === 0) {
        this.delegate.setSelection([planet.id])
        return
      }
      if (selection.has(planet.id)) {
        const next = new Set(selection)
        next.delete(planet.id)
        this.delegate.setSelection([...next])
        return
      }
      // owned planet outside the selection is a reinforce target
      this.delegate.send([...selection], planet.id)
      return
    }

    if (selection.size > 0) {
      this.delegate.send([...selection], planet.id)
    }
  }
}
