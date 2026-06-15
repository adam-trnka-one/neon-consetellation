import { createFileRoute, Link } from '@tanstack/react-router'
import { SourcePanel } from '../components/studio/SourcePanel'
import { StudioStage } from '../components/studio/StudioStage'
import { StylePanel } from '../components/studio/StylePanel'
import { useStudio } from '../recorder/useStudio'

export const Route = createFileRoute('/studio')({
  head: () => ({
    meta: [
      { title: 'Studio — screen + camera recorder' },
      {
        name: 'description',
        content:
          'Record your screen or a window with your camera overlaid, mix in microphone and system audio, and style the framing — all in the browser.',
      },
    ],
  }),
  component: StudioPage,
})

function StudioPage() {
  const studio = useStudio()

  return (
    <main className="relative flex-1">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan hover:text-cyan-300"
          >
            ← Back
          </Link>
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
          Studio
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Share a screen or window, overlay your camera, capture audio, and style the framing. Press
          record and download the result — everything stays in your browser.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <div className="order-2 rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:order-1">
            <SourcePanel studio={studio} />
          </div>
          <div className="order-1 lg:order-2">
            <StudioStage studio={studio} />
          </div>
          <div className="order-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <StylePanel studio={studio} />
          </div>
        </div>
      </div>
    </main>
  )
}
