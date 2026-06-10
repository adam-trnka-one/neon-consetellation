import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Neon Space — real-time strategy game' },
      {
        name: 'description',
        content:
          'Glowing orbs, drifting fleets, infinite galaxies. Every match is a freshly generated star map. Capture every planet to win.',
      },
      { property: 'og:title', content: 'Neon Space' },
      {
        property: 'og:description',
        content: 'A neon real-time strategy game with endless procedurally generated maps.',
      },
      { property: 'og:url', content: 'https://neonspace.game/' },
      { property: 'og:site_name', content: 'Neon Space' },
    ],
  }),
  component: LandingPage,
})

const pillBase =
  'rounded-full px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-colors'

function FeatureCard({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
      <h3 className="font-display font-semibold text-slate-100">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{children}</p>
    </div>
  )
}

function LandingPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* ambient glow, reference-style: violet bottom-left, cyan top-right */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-neon-cyan">
          A real-time strategy game
        </p>

        <h1 className="mt-4 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
            Neon
          </span>
          <br />
          <span className="text-slate-100">Space</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
          Glowing orbs, drifting fleets, infinite galaxies. Every match is a freshly generated
          star map. Capture every planet to win.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            to="/play"
            className={`${pillBase} bg-neon-cyan text-space-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] hover:bg-cyan-300`}
          >
            Play solo
          </Link>
          <span
            aria-disabled="true"
            title="Multiplayer is coming soon"
            className={`${pillBase} cursor-not-allowed bg-neon-magenta/70 text-space-950 opacity-70`}
          >
            Play online
            <span className="ml-2 rounded-full bg-space-950/30 px-2 py-0.5 text-[10px]">soon</span>
          </span>
          <Link
            to="/leaderboard"
            search={{ tab: 'single', page: 1 }}
            className={`${pillBase} border border-white/20 text-slate-200 hover:bg-white/10`}
          >
            Leaderboard
          </Link>
          <Link
            to="/how-to-play"
            className={`${pillBase} border border-white/20 text-slate-200 hover:bg-white/10`}
          >
            How to play
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <FeatureCard title="Infinite maps">
            Procedural generation means no level cap. Replay any star map with its seed.
          </FeatureCard>
          <FeatureCard title="2–4 players">
            Mix human and AI opponents. Three AI difficulty levels per slot.
          </FeatureCard>
          <FeatureCard title="Desktop & touch">
            Click-drag on desktop. Tap, drag and pinch on mobile. Upgrade planets to out-produce
            everyone.
          </FeatureCard>
        </div>

        <p className="mt-12 font-mono text-xs text-slate-600">
          Multiplayer is in development — single-player vs AI is live today.
        </p>
      </div>
    </main>
  )
}
