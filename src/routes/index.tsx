import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Neon Constellations — neon space RTS' },
      {
        name: 'description',
        content:
          'Own planets, grow fleets, capture the constellation. A free real-time strategy game with endless procedurally generated maps.',
      },
      { property: 'og:title', content: 'Neon Constellations' },
      {
        property: 'og:description',
        content: 'A neon real-time strategy game with endless procedurally generated maps.',
      },
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-5xl font-bold tracking-widest text-neon-cyan glow-text sm:text-7xl">
        NEON
        <br />
        CONSTELLATIONS
      </h1>
      <p className="mt-6 max-w-md text-balance text-slate-400">
        Own planets. Grow fleets. Send glowing streams of units across the void and capture the
        whole constellation — on maps that are never the same twice.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/play"
          className="rounded-xl border border-neon-cyan/60 bg-neon-cyan/15 px-8 py-3 font-display text-lg font-semibold tracking-wide text-neon-cyan shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-colors hover:bg-neon-cyan/25"
        >
          Play
        </Link>
        <Link
          to="/how-to-play"
          className="rounded-xl border border-white/15 bg-white/5 px-8 py-3 font-display text-lg font-semibold tracking-wide text-slate-200 transition-colors hover:bg-white/10"
        >
          How to play
        </Link>
      </div>
      <p className="mt-12 text-sm text-slate-600">
        Single player vs AI · Multiplayer coming soon ·{' '}
        <Link to="/leaderboard" search={{ tab: 'single', page: 1 }} className="underline hover:text-slate-400">
          Global leaderboard
        </Link>
      </p>
    </main>
  )
}
