import type { Owner } from '../types'

// p0 human cyan, then magenta / violet / lime AIs
export const OWNER_COLORS = ['#22d3ee', '#e879f9', '#a78bfa', '#a3e635']
export const NEUTRAL_COLOR = '#64748b'
export const BG_COLOR = '#07071a'

export function ownerColor(owner: Owner): string {
  return owner === -1 ? NEUTRAL_COLOR : OWNER_COLORS[owner] ?? NEUTRAL_COLOR
}

export const OWNER_NAMES = ['Cyan', 'Magenta', 'Violet', 'Lime']
