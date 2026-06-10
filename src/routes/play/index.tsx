import { createFileRoute, Link } from '@tanstack/react-router'
import { MatchSetupForm } from '../../components/setup/MatchSetupForm'

export const Route = createFileRoute('/play/')({
  head: () => ({
    meta: [
      { title: 'New match — Neon Space' },
      { name: 'description', content: 'Set up a match: players, AI difficulty, map size and seed.' },
    ],
  }),
  component: PlaySetupPage,
})

function PlaySetupPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-48 -right-40 h-[28rem] w-[28rem] rounded-full bg-violet-600/15 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-xl px-6 py-12 sm:py-16">
        <Link
          to="/"
          className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan hover:text-cyan-300"
        >
          ← Back
        </Link>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-slate-100">
          New match
        </h1>
        <p className="mt-3 text-slate-400">Every game is a fresh procedurally generated galaxy.</p>
        <div className="mt-10">
          <MatchSetupForm />
        </div>
      </div>
    </main>
  )
}
