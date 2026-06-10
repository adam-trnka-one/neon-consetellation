import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/how-to-play')({
  head: () => ({
    meta: [
      { title: 'How to play — Neon Constellations' },
      {
        name: 'description',
        content: 'Rules and controls for Neon Constellations: selection, fleets, capturing planets.',
      },
    ],
  }),
  component: HowToPlayPage,
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-neon-cyan">{title}</h2>
      <div className="mt-3 space-y-2 text-slate-300">{children}</div>
    </section>
  )
}

function HowToPlayPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-slate-100">How to play</h1>

      <Section title="Goal">
        <p>
          Capture <strong>every planet</strong> on the map. You lose when you own no planets and
          have no fleets in flight.
        </p>
      </Section>

      <Section title="Planets & units">
        <ul className="list-disc space-y-1 pl-5">
          <li>Planets come in three sizes — bigger planets hold more units and regenerate faster.</li>
          <li>Planets you own regenerate units up to their cap. Neutral (gray) planets don't.</li>
          <li>Sending a fleet launches <strong>half</strong> of the source planet's units.</li>
          <li>
            On arrival, friendly units reinforce; enemy units subtract one-for-one. If the
            defenders hit zero, the planet is captured by the leftover attackers.
          </li>
        </ul>
      </Section>

      <Section title="Desktop controls">
        <ul className="list-disc space-y-1 pl-5">
          <li>Click one of your planets to select it.</li>
          <li>Shift/Ctrl-click to add planets to the selection, or drag a box on empty space.</li>
          <li>Click any other planet to launch from everything selected (your own planets get reinforced).</li>
          <li>Drag from one of your planets onto a target to send directly.</li>
          <li>Scroll wheel to zoom in and out at the cursor.</li>
          <li>ESC or click empty space to deselect.</li>
        </ul>
      </Section>

      <Section title="Touch controls">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tap one of your planets to select it, then tap a target to send.</li>
          <li>Hold briefly, then drag to box-select multiple planets.</li>
          <li>Drag from your planet onto a target to send directly.</li>
          <li>Pinch to zoom; drag on empty space to pan when zoomed in.</li>
          <li>Tap empty space to deselect.</li>
        </ul>
      </Section>

      <Section title="Maps & seeds">
        <p>
          Every map is procedurally generated — there's no level limit. Each match has a seed shown
          on the end screen; enter it in match setup to replay the exact same map.
        </p>
      </Section>

      <div className="mt-10">
        <Link
          to="/play"
          className="inline-block rounded-xl border border-neon-cyan/60 bg-neon-cyan/15 px-6 py-2.5 font-display font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/25"
        >
          Start a match
        </Link>
      </div>
    </main>
  )
}
