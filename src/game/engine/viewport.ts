export class Viewport {
  scale = 1
  offsetX = 0
  offsetY = 0
  cssWidth = 0
  cssHeight = 0
  dpr = 1

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
    // fit-to-screen with letterbox
    this.scale = Math.min(rect.width / this.worldW, rect.height / this.worldH)
    this.offsetX = (rect.width - this.worldW * this.scale) / 2
    this.offsetY = (rect.height - this.worldH * this.scale) / 2
  }

  worldToScreen(x: number, y: number): { x: number; y: number } {
    return { x: x * this.scale + this.offsetX, y: y * this.scale + this.offsetY }
  }

  screenToWorld(x: number, y: number): { x: number; y: number } {
    return { x: (x - this.offsetX) / this.scale, y: (y - this.offsetY) / this.scale }
  }
}
