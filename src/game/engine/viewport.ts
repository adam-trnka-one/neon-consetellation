// Screen-space margins reserved for the HUD (top stats bar, bottom buttons)
// so the fitted world never hides under the controls.
const INSET = { top: 44, bottom: 76, left: 10, right: 10 }
const MAX_ZOOM = 4

function clampNum(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

export class Viewport {
  scale = 1
  offsetX = 0
  offsetY = 0
  cssWidth = 0
  cssHeight = 0
  dpr = 1

  private baseScale = 1
  private zoom = 1

  constructor(
    private worldW: number,
    private worldH: number,
  ) {}

  resize(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect()
    this.cssWidth = rect.width
    this.cssHeight = rect.height
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(rect.width * this.dpr)
    canvas.height = Math.round(rect.height * this.dpr)
    // fit-to-screen (inside the HUD insets) with letterbox; zoom multiplies it
    this.baseScale = Math.min(this.usableW() / this.worldW, this.usableH() / this.worldH)
    this.scale = this.baseScale * this.zoom
    this.clampPan()
  }

  // Zoom toward a screen-space focal point, keeping the world point under it fixed.
  zoomAt(screenX: number, screenY: number, factor: number): void {
    const newZoom = clampNum(this.zoom * factor, 1, MAX_ZOOM)
    if (newZoom === this.zoom) return
    const worldX = (screenX - this.offsetX) / this.scale
    const worldY = (screenY - this.offsetY) / this.scale
    this.zoom = newZoom
    this.scale = this.baseScale * this.zoom
    this.offsetX = screenX - worldX * this.scale
    this.offsetY = screenY - worldY * this.scale
    this.clampPan()
  }

  panBy(dx: number, dy: number): void {
    this.offsetX += dx
    this.offsetY += dy
    this.clampPan()
  }

  worldToScreen(x: number, y: number): { x: number; y: number } {
    return { x: x * this.scale + this.offsetX, y: y * this.scale + this.offsetY }
  }

  screenToWorld(x: number, y: number): { x: number; y: number } {
    return { x: (x - this.offsetX) / this.scale, y: (y - this.offsetY) / this.scale }
  }

  private usableW(): number {
    return Math.max(this.cssWidth - INSET.left - INSET.right, 50)
  }

  private usableH(): number {
    return Math.max(this.cssHeight - INSET.top - INSET.bottom, 50)
  }

  // Center the world when it fits; otherwise forbid panning past its edges.
  private clampPan(): void {
    const w = this.worldW * this.scale
    const h = this.worldH * this.scale
    const uW = this.usableW()
    const uH = this.usableH()
    this.offsetX =
      w <= uW
        ? INSET.left + (uW - w) / 2
        : clampNum(this.offsetX, INSET.left + uW - w, INSET.left)
    this.offsetY =
      h <= uH
        ? INSET.top + (uH - h) / 2
        : clampNum(this.offsetY, INSET.top + uH - h, INSET.top)
  }
}
