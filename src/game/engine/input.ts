import type { Planet } from '../types'

export interface InputDelegate {
  screenToWorld(x: number, y: number): { x: number; y: number }
  hitTest(worldX: number, worldY: number, inflate: number): Planet | null
  getSelection(): Set<number>
  setSelection(ids: number[]): void
  send(sourceIds: number[], targetId: number): void
  isHumanPlanet(planet: Planet): boolean
  zoomAt(screenX: number, screenY: number, factor: number): void
  panBy(dx: number, dy: number): void
}

const DRAG_THRESHOLD_MOUSE_PX = 8
// fingers wobble more than mice; don't let that cancel a long-press
const DRAG_THRESHOLD_TOUCH_PX = 14
const LONG_PRESS_MS = 250
const TOUCH_HIT_INFLATE = 16

type Mode = 'idle' | 'pending' | 'box' | 'dragSend' | 'pan' | 'pinch'

// Pointer-event state machine handling tap-select, shift/ctrl multi-select,
// drag-box (mouse on empty space, long-press on touch), drag-to-send,
// tap-target launching, one-finger map panning (touch), pinch-to-zoom and
// wheel zoom.
export class InputController {
  boxRect: { x1: number; y1: number; x2: number; y2: number } | null = null
  dragLine: { sx: number; sy: number; x: number; y: number } | null = null

  private mode: Mode = 'idle'
  private pointers = new Map<number, { x: number; y: number }>()
  private downX = 0
  private downY = 0
  private lastX = 0
  private lastY = 0
  private downPlanet: Planet | null = null
  private isTouch = false
  private longPressTimer = 0
  private pinchDist = 0
  private pinchMid = { x: 0, y: 0 }
  // after a pinch ends, swallow the leftover pointer so it can't fire a tap
  private suppressUntilEmpty = false

  constructor(
    private canvas: HTMLCanvasElement,
    private delegate: InputDelegate,
  ) {
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', this.onDown)
    canvas.addEventListener('pointermove', this.onMove)
    canvas.addEventListener('pointerup', this.onUp)
    canvas.addEventListener('pointercancel', this.onCancel)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
    window.addEventListener('keydown', this.onKey)
  }

  destroy(): void {
    clearTimeout(this.longPressTimer)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointercancel', this.onCancel)
    this.canvas.removeEventListener('wheel', this.onWheel)
    window.removeEventListener('keydown', this.onKey)
  }

  private canvasPos(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  private hitInflate(): number {
    return this.isTouch ? TOUCH_HIT_INFLATE : 0
  }

  private dragThreshold(): number {
    return this.isTouch ? DRAG_THRESHOLD_TOUCH_PX : DRAG_THRESHOLD_MOUSE_PX
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    this.canvas.setPointerCapture(e.pointerId)
    const pos = this.canvasPos(e)
    this.pointers.set(e.pointerId, pos)

    if (e.pointerType === 'touch' && this.pointers.size === 2) {
      this.enterPinch()
      return
    }
    if (this.pointers.size > 1 || this.suppressUntilEmpty) return

    this.isTouch = e.pointerType === 'touch'
    this.downX = pos.x
    this.downY = pos.y
    this.lastX = pos.x
    this.lastY = pos.y
    const world = this.delegate.screenToWorld(pos.x, pos.y)
    this.downPlanet = this.delegate.hitTest(world.x, world.y, this.hitInflate())
    this.mode = 'pending'

    if (this.isTouch) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = window.setTimeout(() => {
        if (this.mode === 'pending') {
          this.enterBoxMode()
          try {
            navigator.vibrate?.(15)
          } catch {
            // vibration unsupported
          }
        }
      }, LONG_PRESS_MS)
    }
  }

  private enterPinch(): void {
    clearTimeout(this.longPressTimer)
    this.mode = 'pinch'
    this.boxRect = null
    this.dragLine = null
    const [a, b] = [...this.pointers.values()]
    this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
    this.pinchMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }

  private enterBoxMode(): void {
    this.mode = 'box'
    const start = this.delegate.screenToWorld(this.downX, this.downY)
    this.boxRect = { x1: start.x, y1: start.y, x2: start.x, y2: start.y }
  }

  private onMove = (e: PointerEvent) => {
    if (!this.pointers.has(e.pointerId)) return
    const pos = this.canvasPos(e)
    this.pointers.set(e.pointerId, pos)

    if (this.mode === 'pinch') {
      if (this.pointers.size < 2) return
      const [a, b] = [...this.pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      if (this.pinchDist > 0 && dist > 0) {
        this.delegate.zoomAt(mid.x, mid.y, dist / this.pinchDist)
      }
      this.delegate.panBy(mid.x - this.pinchMid.x, mid.y - this.pinchMid.y)
      this.pinchDist = dist
      this.pinchMid = mid
      return
    }

    if (this.mode === 'idle' || this.suppressUntilEmpty) return
    const world = this.delegate.screenToWorld(pos.x, pos.y)

    if (this.mode === 'pending') {
      const moved = Math.hypot(pos.x - this.downX, pos.y - this.downY) > this.dragThreshold()
      if (!moved) return
      clearTimeout(this.longPressTimer)
      if (this.downPlanet && this.delegate.isHumanPlanet(this.downPlanet)) {
        this.mode = 'dragSend'
      } else if (this.isTouch) {
        // one-finger drag on empty space (or a planet you don't own) pans the map
        this.mode = 'pan'
      } else if (!this.downPlanet) {
        this.enterBoxMode()
      } else {
        this.mode = 'idle'
        this.downPlanet = null
      }
    }

    if (this.mode === 'pan') {
      this.delegate.panBy(pos.x - this.lastX, pos.y - this.lastY)
    }
    if (this.mode === 'box' && this.boxRect) {
      this.boxRect.x2 = world.x
      this.boxRect.y2 = world.y
    }
    if (this.mode === 'dragSend' && this.downPlanet) {
      this.dragLine = { sx: this.downPlanet.x, sy: this.downPlanet.y, x: world.x, y: world.y }
    }
    this.lastX = pos.x
    this.lastY = pos.y
  }

  private onUp = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId)
    clearTimeout(this.longPressTimer)

    if (this.mode === 'pinch') {
      if (this.pointers.size < 2) {
        this.mode = 'idle'
        this.suppressUntilEmpty = this.pointers.size > 0
      }
      return
    }
    if (this.suppressUntilEmpty) {
      if (this.pointers.size === 0) this.suppressUntilEmpty = false
      return
    }

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

  private onCancel = (e: PointerEvent) => {
    this.pointers.delete(e.pointerId)
    clearTimeout(this.longPressTimer)
    if (this.pointers.size === 0) {
      this.mode = 'idle'
      this.suppressUntilEmpty = false
      this.boxRect = null
      this.dragLine = null
    }
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const pos = this.canvasPos(e)
    this.delegate.zoomAt(pos.x, pos.y, Math.exp(-e.deltaY * 0.0015))
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
