import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { readConsent, writeConsent, type ConsentState } from './gate'

interface ConsentContextValue {
  consent: ConsentState
  preferencesOpen: boolean
  acceptAll: () => void
  rejectOptional: () => void
  save: (categories: { analytics: boolean; marketing: boolean }) => void
  openPreferences: () => void
  closePreferences: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(() => readConsent())
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  const update = useCallback((next: ConsentState) => {
    writeConsent(next)
    setConsent(next)
    setPreferencesOpen(false)
  }, [])

  const value: ConsentContextValue = {
    consent,
    preferencesOpen,
    acceptAll: () => update({ decided: true, analytics: true, marketing: true }),
    rejectOptional: () => update({ decided: true, analytics: false, marketing: false }),
    save: ({ analytics, marketing }) => update({ decided: true, analytics, marketing }),
    openPreferences: () => setPreferencesOpen(true),
    closePreferences: () => setPreferencesOpen(false),
  }

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider')
  return ctx
}
