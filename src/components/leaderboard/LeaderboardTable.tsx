import type { ScoreRow } from '../../lib/leaderboard'

export function LeaderboardTable({
  rows,
  startRank,
  ranks,
  highlightQuery,
  myPlayerId,
  onRowClick,
}: {
  rows: ScoreRow[]
  startRank: number
  // explicit per-row global ranks (used for search results); falls back to startRank + index
  ranks?: Array<number | null>
  highlightQuery?: string
  myPlayerId: string | null
  onRowClick: (playerId: string) => void
}) {
  const q = highlightQuery?.trim().toLowerCase()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
          <th className="px-3 pb-2 font-medium">#</th>
          <th className="px-3 pb-2 font-medium">Player</th>
          <th className="px-3 pb-2 text-right font-medium">Score</th>
          <th className="hidden px-3 pb-2 text-right font-medium sm:table-cell">Map</th>
          <th className="hidden px-3 pb-2 text-right font-medium sm:table-cell">Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const exactMatch = q !== undefined && row.nickname.toLowerCase() === q
          const isMe = row.playerId === myPlayerId
          return (
            <tr
              key={row.id}
              onClick={() => onRowClick(row.playerId)}
              className={`cursor-pointer border-t border-white/5 transition-colors hover:bg-white/5 ${
                exactMatch
                  ? 'bg-neon-cyan/10 shadow-[inset_2px_0_0_var(--color-neon-cyan)]'
                  : ''
              }`}
            >
              <td className="px-3 py-2.5 tabular-nums text-slate-500">
                {ranks ? (ranks[i] ?? '–') : startRank + i}
              </td>
              <td className="px-3 py-2.5">
                <span className={exactMatch ? 'font-semibold text-neon-cyan' : 'text-slate-200'}>
                  {row.nickname}
                </span>
                {isMe && (
                  <span className="ml-2 rounded bg-neon-cyan/20 px-1.5 py-0.5 text-xs text-neon-cyan">
                    you
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-right font-display tabular-nums text-slate-100">
                {row.score.toLocaleString()}
              </td>
              <td className="hidden px-3 py-2.5 text-right text-slate-400 sm:table-cell">
                {row.mapSize}
              </td>
              <td className="hidden px-3 py-2.5 text-right tabular-nums text-slate-400 sm:table-cell">
                {Math.floor(row.durationS / 60)}:{String(row.durationS % 60).padStart(2, '0')}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
