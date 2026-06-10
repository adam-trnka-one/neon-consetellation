// Consent storage + gating, usable outside React (e.g. to lazily load a
// future analytics script only after the user opts in).

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing'

export interface ConsentState {
  decided: boolean
  analytics: boolean
  marketing: boolean
}

// versioned so adding a category later can re-prompt users
const STORAGE_KEY = 'nc-consent-v1'
export const CONSENT_EVENT = 'nc:consent-changed'

export const DEFAULT_CONSENT: ConsentState = {
  decided: false,
  analytics: false,
  marketing: false,
}

export function readConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONSENT
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    return {
      decided: parsed.decided === true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    }
  } catch {
    return DEFAULT_CONSENT
  }
}

export function writeConsent(state: ConsentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }))
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === 'necessary') return true
  const state = readConsent()
  return state.decided && state[category]
}

// Runs cb as soon as the category is consented to — immediately if it
// already is, otherwise when the user later opts in. Returns a cleanup.
export function onConsentGranted(category: ConsentCategory, cb: () => void): () => void {
  if (hasConsent(category)) {
    cb()
    return () => {}
  }
  const handler = () => {
    if (hasConsent(category)) {
      window.removeEventListener(CONSENT_EVENT, handler)
      cb()
    }
  }
  window.addEventListener(CONSENT_EVENT, handler)
  return () => window.removeEventListener(CONSENT_EVENT, handler)
}
