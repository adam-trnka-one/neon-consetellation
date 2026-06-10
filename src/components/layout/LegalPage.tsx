import type { ReactNode } from 'react'
import { PageShell } from './PageShell'

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <PageShell title={title} subtitle={`Last updated: ${updated}`} maxWidth="max-w-2xl">
      <div className="space-y-4 text-sm leading-relaxed text-slate-300 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.25em] [&_h2]:text-neon-cyan [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:underline">
        {children}
      </div>
    </PageShell>
  )
}
