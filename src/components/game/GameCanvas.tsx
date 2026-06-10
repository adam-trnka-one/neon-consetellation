import { useEffect, useRef } from 'react'
import { GameEngine } from '../../game/engine/GameEngine'
import type { MatchConfig, MatchResult } from '../../game/types'

export function GameCanvas({
  config,
  onEngine,
  onMatchEnd,
}: {
  config: MatchConfig
  onEngine: (engine: GameEngine | null) => void
  onMatchEnd: (result: MatchResult) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onEngineRef = useRef(onEngine)
  const onMatchEndRef = useRef(onMatchEnd)
  onEngineRef.current = onEngine
  onMatchEndRef.current = onMatchEnd

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new GameEngine(canvas, config)
    engine.onMatchEnd = (result) => onMatchEndRef.current(result)
    onEngineRef.current(engine)
    engine.start()
    return () => {
      engine.destroy()
      onEngineRef.current(null)
    }
  }, [config])

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" />
}
