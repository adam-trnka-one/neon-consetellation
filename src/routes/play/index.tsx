import { createFileRoute } from '@tanstack/react-router'
import { PageShell } from '../../components/layout/PageShell'
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
    <PageShell title="New match" subtitle="Every game is a fresh procedurally generated galaxy.">
      <MatchSetupForm />
    </PageShell>
  )
}
