import { createFileRoute } from '@tanstack/react-router'
import { MatchSetupForm } from '../../components/setup/MatchSetupForm'

export const Route = createFileRoute('/play/')({
  head: () => ({
    meta: [
      { title: 'New match — Neon Constellations' },
      { name: 'description', content: 'Set up a match: players, AI difficulty, map size and seed.' },
    ],
  }),
  component: PlaySetupPage,
})

function PlaySetupPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-slate-100">New match</h1>
      <p className="mt-2 text-sm text-slate-400">
        Configure your opponents and map, then jump in.
      </p>
      <div className="mt-8">
        <MatchSetupForm />
      </div>
    </main>
  )
}
