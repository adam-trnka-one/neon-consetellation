import type { ReactNode } from 'react'

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-slate-100">{title}</h1>
      <p className="mt-1 text-xs text-slate-500">Last updated: {updated}</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neon-cyan [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:underline">
        {children}
      </div>
    </main>
  )
}
