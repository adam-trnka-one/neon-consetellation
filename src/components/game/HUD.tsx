import { Link } from '@tanstack/react-router'
import { useSyncExternalStore } from 'react'
import type { GameEngine } from '../../game/engine/GameEngine'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function HUD({ engine, onRestart }: { engine: GameEngine; onRestart: () => void }) {
  const hud = useSyncExternalStore(engine.subscribe, engine.getHudSnapshot)

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-4 py-3 font-display text-sm text-slate-300">
        <span>
          <span className="text-neon-cyan glow-text">{hud.planetsOwned}</span>
          <span className="text-slate-500">/{hud.totalPlanets} planets</span>
        </span>
        <span>
          <span className="text-neon-cyan glow-text">{hud.units}</span>
          <span className="text-slate-500"> units</span>
        </span>
        <span className="text-slate-400">{formatTime(hud.elapsed)}</span>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => engine.togglePause()}
          className="rounded-lg border border-white/15 bg-space-900/80 px-3 py-2 text-sm text-slate-200 backdrop-blur hover:bg-white/10 cursor-pointer"
        >
          {hud.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={onRestart}
          className="rounded-lg border border-white/15 bg-space-900/80 px-3 py-2 text-sm text-slate-200 backdrop-blur hover:bg-white/10 cursor-pointer"
        >
          ↻ Restart
        </button>
        <Link
          to="/play"
          className="rounded-lg border border-white/15 bg-space-900/80 px-3 py-2 text-sm text-slate-200 backdrop-blur hover:bg-white/10"
        >
          ✕ Quit
        </Link>
      </div>

      {hud.status === 'paused' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl font-bold tracking-widest text-slate-200 glow-text">
            PAUSED
          </span>
        </div>
      )}
    </>
  )
}
