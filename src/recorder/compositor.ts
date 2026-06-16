import type { ScreenStyle, StageStyle } from './types'

export type Box = { x: number; y: number; w: number; h: number }

type Click = { nx: number; ny: number; t: number }
const CLICK_DURATION = 650

/**
 * Draws the screen share and camera onto a single canvas every animation
 * frame, applying the user's framing/border styling. The canvas doubles as
 * the live preview and as the video source for the recorder via captureStream.
 */
export class Compositor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private style: StageStyle
  private screen: HTMLVideoElement | null = null
  private camera: HTMLVideoElement | null = null
  private raf = 0
  private running = false
  // The camera bubble's last drawn rect (canvas px), for drag hit-testing.
  private cameraRect: Box | null = null
  // The main content (screen / camera-only) rect, for placing click ripples.
  private contentRect: Box | null = null
  private contentRadius = 0
  private clicks: Click[] = []

  constructor(canvas: HTMLCanvasElement, style: StageStyle) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D canvas context')
    this.ctx = ctx
    this.style = style
    this.applyResolution()
  }

  setStyle(style: StageStyle) {
    const resized = style.width !== this.style.width || style.height !== this.style.height
    this.style = style
    if (resized) this.applyResolution()
  }

  setScreen(video: HTMLVideoElement | null) {
    this.screen = video
  }

  setCamera(video: HTMLVideoElement | null) {
    this.camera = video
  }

  start() {
    if (this.running) return
    this.running = true
    const loop = () => {
      if (!this.running) return
      this.draw()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  captureStream(fps: number): MediaStream {
    return this.canvas.captureStream(fps)
  }

  /** The camera bubble's current rect in canvas pixels, or null if hidden. */
  getCameraRect(): Box | null {
    return this.cameraRect
  }

  /** Register a click ripple at a normalised position over the main content. */
  addClick(nx: number, ny: number) {
    this.clicks.push({ nx, ny, t: performance.now() })
  }

  private applyResolution() {
    this.canvas.width = this.style.width
    this.canvas.height = this.style.height
  }

  private draw() {
    const { style } = this
    const { width, height } = style
    this.paintBackground()

    const screenReady = isReady(this.screen)
    const cameraReady = isReady(this.camera)
    const stage: Box = {
      x: style.screen.padding,
      y: style.screen.padding,
      w: width - style.screen.padding * 2,
      h: height - style.screen.padding * 2,
    }

    if (screenReady) {
      const fit = fitContain(this.screen!, stage)
      this.drawFramedVideo(this.screen!, fit, style.screen)
      this.contentRect = fit.dest
      this.contentRadius = style.screen.radius
      this.drawClicks()
      if (cameraReady) this.drawCamera()
      else this.cameraRect = null
    } else if (cameraReady) {
      // Camera-only: the camera becomes the main framed subject.
      const fit = fitContain(this.camera!, stage)
      this.drawFramedVideo(this.camera!, fit, style.screen, style.camera.mirror)
      this.contentRect = fit.dest
      this.contentRadius = style.screen.radius
      this.drawClicks()
      this.cameraRect = null
    } else {
      this.drawPlaceholder()
      this.contentRect = null
      this.cameraRect = null
    }
  }

  private drawClicks() {
    const rect = this.contentRect
    if (!rect) return
    const now = performance.now()
    this.clicks = this.clicks.filter((c) => now - c.t < CLICK_DURATION)
    if (this.clicks.length === 0) return
    const { ctx } = this
    ctx.save()
    roundedPath(ctx, rect, this.contentRadius)
    ctx.clip()
    for (const c of this.clicks) {
      const p = (now - c.t) / CLICK_DURATION
      const x = rect.x + c.nx * rect.w
      const y = rect.y + c.ny * rect.h
      const r = 6 + p * 34
      const alpha = 1 - p
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(34,211,238,${alpha * 0.9})`
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(34,211,238,${alpha * 0.55})`
      ctx.fill()
    }
    ctx.restore()
  }

  private paintBackground() {
    const { ctx, style } = this
    const bg = style.background
    if (bg.type === 'gradient') {
      const rad = (bg.angle * Math.PI) / 180
      const cx = style.width / 2
      const cy = style.height / 2
      const len = Math.max(style.width, style.height)
      const dx = (Math.cos(rad) * len) / 2
      const dy = (Math.sin(rad) * len) / 2
      const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy)
      grad.addColorStop(0, bg.from)
      grad.addColorStop(1, bg.to)
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = bg.color
    }
    ctx.fillRect(0, 0, style.width, style.height)
  }

  private drawCamera() {
    const cam = this.camera!
    const style = this.style.camera
    const { width, height } = this.style
    const ph = (style.size / 100) * height
    const aspect = style.shape === 'rounded' ? cam.videoWidth / cam.videoHeight || 16 / 9 : 1
    const pw = ph * aspect
    // Position by the bubble centre (style.x/style.y), clamped to the stage.
    const x = clamp(style.x * width - pw / 2, 0, width - pw)
    const y = clamp(style.y * height - ph / 2, 0, height - ph)
    const rect: Box = { x, y, w: pw, h: ph }
    this.cameraRect = rect
    const radius = style.shape === 'circle' ? Math.min(pw, ph) / 2 : style.shape === 'square' ? 0 : style.radius
    this.drawFramedVideo(
      cam,
      fitCover(cam, rect),
      { radius, padding: 0, borderWidth: style.borderWidth, borderColor: style.borderColor, shadow: style.shadow },
      style.mirror,
    )
  }

  /** Draws a video into a box with rounded clipping, border and drop shadow. */
  private drawFramedVideo(
    video: HTMLVideoElement,
    fit: { dest: Box; src: Box },
    frame: ScreenStyle,
    mirror = false,
  ) {
    const { ctx } = this
    const { dest, src } = fit

    ctx.save()
    if (frame.shadow > 0) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)'
      ctx.shadowBlur = frame.shadow
      ctx.shadowOffsetY = frame.shadow * 0.3
    }
    // Paint an opaque rounded backing so the shadow renders cleanly.
    roundedPath(ctx, dest, frame.radius)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.restore()

    ctx.save()
    roundedPath(ctx, dest, frame.radius)
    ctx.clip()
    if (mirror) {
      ctx.translate(dest.x * 2 + dest.w, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, src.x, src.y, src.w, src.h, dest.x, dest.y, dest.w, dest.h)
    ctx.restore()

    if (frame.borderWidth > 0) {
      ctx.save()
      roundedPath(ctx, inset(dest, frame.borderWidth / 2), frame.radius)
      ctx.lineWidth = frame.borderWidth
      ctx.strokeStyle = frame.borderColor
      ctx.stroke()
      ctx.restore()
    }
  }

  private drawPlaceholder() {
    const { ctx, style } = this
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '600 26px "DM Sans", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Enable a screen or camera source to begin', style.width / 2, style.height / 2)
    ctx.restore()
  }
}

function isReady(v: HTMLVideoElement | null): v is HTMLVideoElement {
  return !!v && v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundedPath(ctx: CanvasRenderingContext2D, b: Box, radius: number) {
  const r = Math.max(0, Math.min(radius, b.w / 2, b.h / 2))
  ctx.beginPath()
  ctx.roundRect(b.x, b.y, b.w, b.h, r)
}

function inset(b: Box, amount: number): Box {
  return { x: b.x + amount, y: b.y + amount, w: b.w - amount * 2, h: b.h - amount * 2 }
}

/** Letterbox the whole frame inside the box, preserving aspect ratio. */
function fitContain(v: HTMLVideoElement, box: Box): { dest: Box; src: Box } {
  const vw = v.videoWidth
  const vh = v.videoHeight
  const scale = Math.min(box.w / vw, box.h / vh)
  const w = vw * scale
  const h = vh * scale
  const dest: Box = { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h }
  return { dest, src: { x: 0, y: 0, w: vw, h: vh } }
}

/** Fill the box, cropping the source to preserve aspect ratio. */
function fitCover(v: HTMLVideoElement, box: Box): { dest: Box; src: Box } {
  const vw = v.videoWidth
  const vh = v.videoHeight
  const scale = Math.max(box.w / vw, box.h / vh)
  const cropW = box.w / scale
  const cropH = box.h / scale
  const src: Box = { x: (vw - cropW) / 2, y: (vh - cropH) / 2, w: cropW, h: cropH }
  return { dest: box, src }
}
