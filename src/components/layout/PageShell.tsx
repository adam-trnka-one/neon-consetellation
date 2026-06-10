import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

// Shared page chrome matching the landing design: ambient glow, tracked
// uppercase back link, hero heading and muted subtitle.
export function PageShell({
  title,
  subtitle,
  maxWidth = 'max-w-xl',
  children,
}: {
  title: string
  subtitle?: ReactNode
  maxWidth?: string
  children: ReactNode
}) {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-48 -right-40 h-[28rem] w-[28rem] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute -left-32 -top-40 h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>
      <div className={`relative mx-auto w-full ${maxWidth} px-6 py-12 sm:py-16`}>
        <Link
          to="/"
          className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan hover:text-cyan-300"
        >
          ← Back
        </Link>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-slate-100">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-slate-400">{subtitle}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </main>
  )
}
