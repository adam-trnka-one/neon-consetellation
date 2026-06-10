import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { GameCanvas } from '../../components/game/GameCanvas'
import { HUD } from '../../components/game/HUD'
import { MatchEndOverlay } from '../../components/game/MatchEndOverlay'
import type { GameEngine } from '../../game/engine/GameEngine'
import type { MatchResult } from '../../game/types'
import { matchSearchSchema, matchSearchToConfig } from '../../lib/searchSchemas'

export const Route = createFileRoute('/play/match')({
  validateSearch: matchSearchSchema,
  head: () => ({
    meta: [
      { title: 'In match — Neon Constellations' },
      { name: 'description', content: 'Capture every planet in the constellation.' },
    ],
  }),
  component: MatchPage,
})

function MatchPage() {
  const search = Route.useSearch()
  const configKey = `${search.seed}:${search.map}:${search.ai.join(',')}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => matchSearchToConfig(search), [configKey])

  const [engine, setEngine] = useState<GameEngine | null>(null)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [resetCount, setResetCount] = useState(0)

  const restart = () => {
    setResult(null)
    setResetCount((c) => c + 1)
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <GameCanvas
        key={`${configKey}:${resetCount}`}
        config={config}
        onEngine={setEngine}
        onMatchEnd={setResult}
      />
      {engine && !result && <HUD engine={engine} onRestart={restart} />}
      {result && <MatchEndOverlay result={result} onRestart={restart} />}
    </div>
  )
}
