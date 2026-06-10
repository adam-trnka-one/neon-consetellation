export type Rng = () => number

// string hash → 32-bit seeds
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

export function mulberry32(a: number): Rng {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed: string): Rng {
  return mulberry32(xmur3(seed)())
}

export function randRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1))
}

export function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomSeedString(): string {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)]
  }
  return s
}
