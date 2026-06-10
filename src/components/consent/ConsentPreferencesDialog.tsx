import { useEffect, useState } from 'react'
import { useConsent } from '../../lib/consent/ConsentContext'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <label className={`flex items-start gap-3 rounded-lg border border-white/10 p-3 ${disabled ? 'opacity-70' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 size-4 accent-cyan-400"
      />
      <span>
        <span className="block font-medium text-slate-100">
          {label}
          {disabled && <span className="ml-2 text-xs text-slate-400">(always on)</span>}
        </span>
        <span className="block text-sm text-slate-400">{description}</span>
      </span>
    </label>
  )
}

export function ConsentPreferencesDialog() {
  const { consent, preferencesOpen, closePreferences, save, acceptAll } = useConsent()
  const [analytics, setAnalytics] = useState(consent.analytics)
  const [marketing, setMarketing] = useState(consent.marketing)

  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent.analytics)
      setMarketing(consent.marketing)
    }
  }, [preferencesOpen, consent])

  return (
    <Dialog open={preferencesOpen} onClose={closePreferences} title="Cookie preferences">
      <div className="space-y-3">
        <Toggle
          label="Strictly necessary"
          description="Required for the site to work: your match settings, anonymous player ID, nickname and this consent choice."
          checked
          disabled
        />
        <Toggle
          label="Analytics"
          description="Helps us understand how the game is played. We don't use any analytics yet; this consent gates any we add later."
          checked={analytics}
          onChange={setAnalytics}
        />
        <Toggle
          label="Marketing"
          description="Used for promotional content. Not in use today; gates any future marketing scripts."
          checked={marketing}
          onChange={setMarketing}
        />
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={() => save({ analytics: false, marketing: false })}>
          Reject optional
        </Button>
        <Button variant="ghost" onClick={() => save({ analytics, marketing })}>
          Save preferences
        </Button>
        <Button onClick={acceptAll}>Accept all</Button>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Details in our{' '}
        <a href="/cookies" className="underline hover:text-slate-300">
          cookie policy
        </a>
        .
      </p>
    </Dialog>
  )
}
