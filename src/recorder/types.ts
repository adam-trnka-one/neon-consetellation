// Shared types for the screen + camera recording studio.

export interface MediaDevice {
  deviceId: string
  label: string
}

export type CameraShape = 'circle' | 'rounded' | 'square'
export type CameraCorner = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

export type StageBackground =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }

/** Styling for the shared screen frame on the stage. */
export interface ScreenStyle {
  radius: number // corner rounding, px
  padding: number // inset from the stage edges, px
  borderWidth: number // px
  borderColor: string
  shadow: number // drop-shadow blur, px (0 = none)
}

/** Styling for the camera picture-in-picture overlay. */
export interface CameraStyle {
  shape: CameraShape
  size: number // height as a percentage of the stage height (camera-only: ignored)
  x: number // bubble centre, 0..1 of stage width (drag to reposition)
  y: number // bubble centre, 0..1 of stage height
  radius: number // corner rounding for the 'rounded' shape, px
  borderWidth: number // px
  borderColor: string
  shadow: number // drop-shadow blur, px
  mirror: boolean // flip horizontally (natural selfie view)
}

export interface StageStyle {
  background: StageBackground
  width: number // output canvas width, px
  height: number // output canvas height, px
  fps: number
  screen: ScreenStyle
  camera: CameraStyle
}

export type RecordingStatus = 'idle' | 'recording' | 'paused'

export interface RecordingResult {
  url: string
  blob: Blob
  mimeType: string
  size: number
  durationMs: number
}
