import { useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { fileExtensionFor, formatBytes, formatDuration } from '../../recorder/recorder'
import type { useStudio } from '../../recorder/useStudio'

type Studio = ReturnType<typeof useStudio>

export function StudioStage({ studio }: { studio: Studio }) {
  const { status, result, hasVideoSource, elapsedMs, style } = studio
  const recording = status === 'recording'
  const paused = status === 'paused'

  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)

  // Map a pointer event to normalised stage coordinates (0..1).
  function normPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      nx: (e.clientX - rect.left) / rect.width,
      ny: (e.clientY - rect.top) / rect.height,
    }
  }

  function overCamera(e: React.PointerEvent<HTMLCanvasElement>, nx: number, ny: number) {
    const r = studio.getCameraRect()
    if (!r) return false
    const px = nx * e.currentTarget.width
    const py = ny * e.currentTarget.height
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!studio.sources.camera) return
    const { nx, ny } = normPoint(e)
    if (overCamera(e, nx, ny)) {
      draggingRef.current = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
      studio.setCameraCenter(nx, ny)
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const { nx, ny } = normPoint(e)
    if (draggingRef.current) {
      studio.setCameraCenter(nx, ny)
    } else {
      setHovering(studio.sources.camera && overCamera(e, nx, ny))
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (draggingRef.current) {
      draggingRef.current = false
      setDragging(false)
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const cursor = dragging ? 'grabbing' : hovering ? 'grab' : 'default'

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        <canvas
          ref={studio.canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="block w-full touch-none select-none"
          style={{ aspectRatio: `${style.width} / ${style.height}`, cursor }}
        />
        {(recording || paused) && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-sm font-semibold backdrop-blur">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                recording ? 'animate-pulse bg-rose-500' : 'bg-amber-400'
              }`}
            />
            <span className="tabular-nums text-slate-100">{formatDuration(elapsedMs)}</span>
            {paused && <span className="text-amber-300">Paused</span>}
          </div>
        )}
      </div>

      {studio.sources.camera && (
        <p className="text-xs text-slate-500">Tip: drag the camera bubble in the preview to reposition it.</p>
      )}

      {studio.error && (
        <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {studio.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status === 'idle' ? (
          <Button onClick={studio.startRecording} disabled={!hasVideoSource}>
            ● Start recording
          </Button>
        ) : (
          <>
            <Button variant="danger" onClick={studio.stopRecording}>
              ■ Stop
            </Button>
            {recording ? (
              <Button variant="ghost" onClick={studio.pauseRecording}>
                ❚❚ Pause
              </Button>
            ) : (
              <Button variant="ghost" onClick={studio.resumeRecording}>
                ▶ Resume
              </Button>
            )}
          </>
        )}
        {!hasVideoSource && status === 'idle' && (
          <span className="text-sm text-slate-500">Enable a screen or camera to record.</span>
        )}
      </div>

      {result && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-200">
              Latest recording
            </h3>
            <span className="text-xs text-slate-500">
              {formatDuration(result.durationMs)} · {formatBytes(result.size)}
            </span>
          </div>
          <video src={result.url} controls className="w-full rounded-lg bg-black" />
          <div className="flex flex-wrap gap-3">
            <a
              href={result.url}
              download={`recording.${fileExtensionFor(result.mimeType)}`}
              className="rounded-lg border border-neon-cyan/60 bg-neon-cyan/15 px-4 py-2 font-display text-sm font-semibold text-neon-cyan shadow-[0_0_18px_rgba(34,211,238,0.25)] hover:bg-neon-cyan/25"
            >
              ↓ Download
            </a>
            <Button variant="ghost" onClick={studio.clearResult}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
