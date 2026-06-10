// Pre-rendered radial glow sprites — drawing gradients per frame is too slow
// on mobile, a cached drawImage is not.
const cache = new Map<string, HTMLCanvasElement>()

export function getGlowSprite(color: string, size = 64): HTMLCanvasElement {
  const key = `${color}:${size}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.25, color)
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  cache.set(key, canvas)
  return canvas
}

export function drawGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  radius: number,
  alpha = 1,
): void {
  const sprite = getGlowSprite(color)
  ctx.globalAlpha = alpha
  ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2)
  ctx.globalAlpha = 1
}
