import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/layout/LegalPage'
import { useConsent } from '../lib/consent/ConsentContext'

export const Route = createFileRoute('/cookies')({
  head: () => ({
    meta: [
      { title: 'Cookie policy — Neon Space' },
      { name: 'description', content: 'Cookies and local storage used by Neon Space.' },
    ],
  }),
  component: CookiesPage,
})

function CookiesPage() {
  const { openPreferences } = useConsent()
  return (
    <LegalPage title="Cookie policy" updated="June 2026">
      <p>
        Neon Space uses no traditional tracking cookies. We use your browser's{' '}
        <strong>local storage</strong> for a small set of strictly necessary values, and we gate
        any optional categories behind your consent.
      </p>

      <h2>Strictly necessary (always on)</h2>
      <ul>
        <li>
          <code>nc-player-id</code> — anonymous player identifier for the leaderboard.
        </li>
        <li>
          <code>nc-nickname</code> — your chosen display name.
        </li>
        <li>
          <code>nc-consent-v1</code> — your consent choices themselves.
        </li>
      </ul>

      <h2>Analytics (opt-in)</h2>
      <p>
        Not in use today. If we add analytics later, the scripts will load only after you enable
        this category.
      </p>

      <h2>Marketing (opt-in)</h2>
      <p>
        Not in use today. Reserved for possible future promotional integrations; same opt-in rule
        applies.
      </p>

      <h2>Managing your choices</h2>
      <p>
        You can change your preferences anytime via{' '}
        <button onClick={openPreferences} className="underline cursor-pointer">
          Cookie settings
        </button>{' '}
        (also linked in the footer of every page). Questions:{' '}
        <a href="mailto:privacy@neonspace.game">privacy@neonspace.game</a>.
      </p>
    </LegalPage>
  )
}
