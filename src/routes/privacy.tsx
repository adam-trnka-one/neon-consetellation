import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '../components/layout/LegalPage'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy policy — Neon Constellations' },
      { name: 'description', content: 'How Neon Constellations handles your data.' },
    ],
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="June 2026">
      <p>
        Neon Constellations is a free browser game. We collect as little data as possible and we
        never sell it. This policy explains what we store, why, and your rights under the GDPR.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Anonymous player ID</strong> — a random identifier created in your browser so
          your leaderboard scores belong to "you" without an account.
        </li>
        <li>
          <strong>Nickname</strong> — the display name you choose for the global leaderboard.
        </li>
        <li>
          <strong>Match results</strong> — score, map size, match duration and the end-of-match
          standings you choose to submit to the leaderboard.
        </li>
        <li>
          <strong>Consent choices</strong> — your cookie/storage preferences.
        </li>
      </ul>
      <p>
        We do not collect your name, email address, IP-based profiles, or any advertising
        identifiers. We currently run no analytics or marketing scripts; if we ever add them, they
        will stay disabled until you opt in via the consent banner.
      </p>

      <h2>Legal basis</h2>
      <p>
        Strictly necessary storage is processed under our legitimate interest in operating the
        game. Optional categories (analytics, marketing) are processed only with your consent,
        which you can withdraw anytime via "Cookie settings" in the footer.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your leaderboard data (identified
        by your anonymous player ID, visible in your browser's local storage). Contact us at{' '}
        <a href="mailto:privacy@neon.star">privacy@neon.star</a> and we'll respond within 30 days.
        You also have the right to lodge a complaint with your local supervisory authority.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href="mailto:privacy@neon.star">privacy@neon.star</a>{' '}
        (placeholder contact address).
      </p>
    </LegalPage>
  )
}
