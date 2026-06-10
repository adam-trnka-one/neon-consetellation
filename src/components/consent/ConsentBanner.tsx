import { useConsent } from '../../lib/consent/ConsentContext'
import { Button } from '../ui/Button'
import { ConsentPreferencesDialog } from './ConsentPreferencesDialog'

export function ConsentBanner() {
  const { consent, preferencesOpen, acceptAll, rejectOptional, openPreferences } = useConsent()

  return (
    <>
      {!consent.decided && !preferencesOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-space-900/95 p-5 shadow-2xl backdrop-blur">
            <h2 className="font-display font-semibold text-slate-100">Cookies & local storage</h2>
            <p className="mt-2 text-sm text-slate-400">
              We use strictly necessary local storage to run the game (settings, anonymous player
              ID, nickname). Optional analytics and marketing categories are off until you allow
              them. See our{' '}
              <a href="/cookies" className="underline hover:text-slate-200">
                cookie policy
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-slate-200">
                privacy policy
              </a>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={acceptAll}>Accept all</Button>
              <Button variant="ghost" onClick={rejectOptional}>
                Reject optional
              </Button>
              <Button variant="ghost" onClick={openPreferences}>
                Manage preferences
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConsentPreferencesDialog />
    </>
  )
}
