import type { StageStyle } from './types'

export const DEFAULT_STYLE: StageStyle = {
  background: { type: 'gradient', from: '#0b0b26', to: '#1e1e4f', angle: 135 },
  width: 1280,
  height: 720,
  fps: 30,
  screen: {
    radius: 18,
    padding: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadow: 40,
  },
  camera: {
    shape: 'circle',
    size: 26,
    x: 0.16,
    y: 0.82,
    radius: 24,
    borderWidth: 3,
    borderColor: '#22d3ee',
    shadow: 30,
    mirror: true,
  },
}

/** Output resolution presets the user can pick between. */
export const RESOLUTIONS: { label: string; width: number; height: number }[] = [
  { label: '720p', width: 1280, height: 720 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: 'Square', width: 1080, height: 1080 },
  { label: 'Vertical', width: 720, height: 1280 },
]
