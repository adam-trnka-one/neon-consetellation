import { createFileRoute, Link } from '@tanstack/react-router'
import { PageShell } from '../components/layout/PageShell'

export const Route = createFileRoute('/how-to-play')({
  head: () => ({
    meta: [
      { title: 'How to play — Neon Space' },
      {
        name: 'description',
        content: 'Rules and controls for Neon Space: selection, fleets, capturing planets.',
      },
    ],
  }),
  component: HowToPlayPage,
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">
        {title}
      </h2>
      <div className="mt-3 space-y-2 text-slate-300">{children}</div>
    </section>
  )
}

function HowToPlayPage() {
  return (
    <PageShell
      title="How to play"
      subtitle="Rules and controls reference."
      maxWidth="max-w-2xl"
    >
      <Section title="Goal">
        <p>
          Capture <strong>every planet</strong> on the map. You lose when you own no planets and
          have no fleets in flight.
        </p>
      </Section>

      <Section title="Planets & units">
        <ul className="list-disc space-y-1 pl-5">
          <li>Planets come in three sizes — bigger planets can store more units.</li>
          <li>
            Planets you own produce <strong>1 unit per second</strong> up to their cap. Neutral
            (gray) planets don't produce.
          </li>
          <li>Sending a fleet launches <strong>half</strong> of the source planet's units.</li>
          <li>
            On arrival, friendly units reinforce; enemy units subtract one-for-one. If the
            defenders hit zero, the planet is captured by the leftover attackers.
          </li>
        </ul>
      </Section>

      <Section title="Upgrading planets">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Send units to one of your own planets to invest in it. When it reaches{' '}
            <strong>30 units</strong>, they're consumed and the planet upgrades.
          </li>
          <li>
            An upgraded planet grows, produces units <strong>twice as fast</strong>, and stores
            more — it wears a ring in your color.
          </li>
          <li>Captured planets keep their upgrade — fight for them!</li>
        </ul>
      </Section>

      <Section title="Desktop controls">
        <ul className="list-disc space-y-1 pl-5">
          <li>Click one of your planets to select it.</li>
          <li>Shift/Ctrl-click to add planets to the selection, or drag a box on empty space.</li>
          <li>Click any other planet to launch from everything selected (your own planets get reinforced).</li>
          <li>Drag from one of your planets onto a target to send directly.</li>
          <li>Scroll wheel to zoom at the cursor; drag with the middle or right button to pan.</li>
          <li>ESC or click empty space to deselect.</li>
        </ul>
      </Section>

      <Section title="Touch controls">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tap one of your planets to select it, then tap a target to send.</li>
          <li>Drag on empty space to box-select multiple planets.</li>
          <li>Drag from your planet onto a target to send directly.</li>
          <li>Pinch to zoom; move both fingers to pan.</li>
          <li>Tap empty space to deselect.</li>
        </ul>
      </Section>

      <Section title="Maps & seeds">
        <p>
          Every map is procedurally generated — there's no level limit. Each match has a seed shown
          on the end screen; enter it in match setup to replay the exact same map.
        </p>
      </Section>

      <div className="mt-12">
        <Link
          to="/play"
          className="inline-block rounded-full bg-neon-cyan px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.25em] text-space-950 shadow-[0_0_24px_rgba(34,211,238,0.45)] transition-colors hover:bg-cyan-300"
        >
          Start a match
        </Link>
      </div>
    </PageShell>
  )
}
