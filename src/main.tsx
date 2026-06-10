import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConsentProvider } from './lib/consent/ConsentContext'
import { routeTree } from './routeTree.gen'
import './styles/index.css'

const router = createRouter({ routeTree, scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConsentProvider>
      <RouterProvider router={router} />
    </ConsentProvider>
  </StrictMode>,
)
