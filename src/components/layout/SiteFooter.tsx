import { Link } from '@tanstack/react-router'
import { useConsent } from '../../lib/consent/ConsentContext'

export function SiteFooter() {
  const { openPreferences } = useConsent()
  return (
    <footer className="border-t border-white/10 px-6 py-6 text-sm text-slate-400">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <span className="font-display text-slate-500">Neon Space</span>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/studio" className="hover:text-slate-200">
            Studio
          </Link>
          <Link to="/how-to-play" className="hover:text-slate-200">
            How to play
          </Link>
          <Link to="/leaderboard" search={{ tab: 'single', page: 1 }} className="hover:text-slate-200">
            Leaderboard
          </Link>
          <Link to="/login" className="hover:text-slate-200">
            Account
          </Link>
          <Link to="/privacy" className="hover:text-slate-200">
            Privacy
          </Link>
          <Link to="/cookies" className="hover:text-slate-200">
            Cookies
          </Link>
          <Link to="/terms" className="hover:text-slate-200">
            Terms
          </Link>
          <button onClick={openPreferences} className="hover:text-slate-200 cursor-pointer">
            Cookie settings
          </button>
        </nav>
      </div>
    </footer>
  )
}
