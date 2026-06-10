import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useSyncExternalStore } from 'react'
import type { GameEngine } from '../../game/engine/GameEngine'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

const iconButtonClass =
  'flex items-center gap-1.5 rounded-lg border border-white/15 bg-space-900/80 px-2.5 py-1.5 text-sm text-slate-200 backdrop-blur hover:bg-white/10 cursor-pointer'

export function HUD({ engine, onRestart }: { engine: GameEngine; onRestart: () => void }) {
  const hud = useSyncExternalStore(engine.subscribe, engine.getHudSnapshot)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const paused = hud.status === 'paused'

  return (
    <>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-3 py-2 font-display text-sm text-slate-300">
        <div className="pointer-events-none flex items-center gap-3 sm:gap-5">
          <span>
            <span className="text-neon-cyan glow-text">{hud.planetsOwned}</span>
            <span className="text-slate-500">/{hud.totalPlanets} 🪐</span>
          </span>
          <span>
            <span className="text-neon-cyan glow-text">{hud.units}</span>
            <span className="text-slate-500"> ⬡</span>
          </span>
          <span className="text-slate-400">{formatTime(hud.elapsed)}</span>
        </div>

        {/* inline icon buttons on larger screens */}
        <div className="hidden items-center gap-2 sm:flex">
          <button onClick={() => engine.togglePause()} className={iconButtonClass}>
            {paused ? '▶' : '⏸'}
            <span>{paused ? 'Resume' : 'Pause'}</span>
          </button>
          <button onClick={onRestart} className={iconButtonClass}>
            ↻<span>Restart</span>
          </button>
          <Link to="/play" className={iconButtonClass}>
            ✕<span>Quit</span>
          </Link>
        </div>

        {/* compact menu on mobile */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Game menu"
            aria-expanded={menuOpen}
            className={`${iconButtonClass} !px-3 text-base`}
          >
            ☰
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-white/15 bg-space-900/95 shadow-2xl backdrop-blur">
              <button
                onClick={() => {
                  engine.togglePause()
                  setMenuOpen(false)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                <span className="text-base">{paused ? '▶' : '⏸'}</span>
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onRestart()
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                <span className="text-base">↻</span>
                Restart
              </button>
              <button
                onClick={() => navigate({ to: '/play' })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                <span className="text-base">✕</span>
                Quit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* tap-away to close the mobile menu */}
      {menuOpen && (
        <div className="absolute inset-0 z-10 sm:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {paused && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl font-bold tracking-widest text-slate-200 glow-text">
            PAUSED
          </span>
        </div>
      )}
    </>
  )
}
