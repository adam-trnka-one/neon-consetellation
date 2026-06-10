import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/layout/LegalPage'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      { title: 'Terms of service — Neon Space' },
      { name: 'description', content: 'Terms of service for Neon Space.' },
    ],
  }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="June 2026">
      <p>
        By playing Neon Space you agree to these terms. The game is provided free of
        charge, "as is", without warranties of any kind.
      </p>

      <h2>Fair play</h2>
      <ul>
        <li>Don't submit forged or automated leaderboard scores.</li>
        <li>Choose a nickname that isn't offensive, impersonating, or misleading.</li>
        <li>We may remove leaderboard entries that violate these rules.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Leaderboard submissions (nickname and match results) are public. Don't put personal
        information in your nickname.
      </p>

      <h2>Availability & changes</h2>
      <p>
        We may modify, suspend, or discontinue the game or the leaderboard at any time. We may
        update these terms; continued play after changes means acceptance.
      </p>

      <h2>Liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any damages arising from
        your use of the game.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:privacy@neonspace.game">privacy@neonspace.game</a>{' '}
        (placeholder contact address).
      </p>
    </LegalPage>
  )
}
