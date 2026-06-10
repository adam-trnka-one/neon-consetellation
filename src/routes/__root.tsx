import { createRootRoute, HeadContent, Outlet, useRouterState } from '@tanstack/react-router'
import { ConsentBanner } from '../components/consent/ConsentBanner'
import { SiteFooter } from '../components/layout/SiteFooter'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Neon Constellations' },
      {
        name: 'description',
        content:
          'A neon real-time strategy game of glowing orbs and particle fleets. Capture every planet on endlessly generated maps.',
      },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const fullscreenGame = pathname === '/play/match'

  return (
    <div className="flex min-h-dvh flex-col bg-space-950 font-body text-slate-200">
      <HeadContent />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      {!fullscreenGame && <SiteFooter />}
      <ConsentBanner />
    </div>
  )
}
