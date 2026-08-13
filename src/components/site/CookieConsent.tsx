import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  COOKIE_CONSENT_REOPEN,
  readCookieConsent,
  updateAnalyticsConsent,
  writeCookieConsent,
  type TCookieConsent,
} from '@/lib/gtm'

/**
 * GDPR banner wired to Consent Mode v2.
 * Defaults are denied in index.html before gtm.js. This only updates after a choice.
 */
export function CookieConsent() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = readCookieConsent()
    if (stored === 'granted') {
      updateAnalyticsConsent('granted')
    } else if (stored === null) {
      setOpen(true)
    }
    const reopen = () => setOpen(true)
    window.addEventListener(COOKIE_CONSENT_REOPEN, reopen)
    return () => window.removeEventListener(COOKIE_CONSENT_REOPEN, reopen)
  }, [])

  function choose(choice: TCookieConsent) {
    writeCookieConsent(choice)
    updateAnalyticsConsent(choice)
    setOpen(false)
  }

  if (!open) return null

  return (
    <aside
      role="dialog"
      aria-labelledby="sidus-cookie-title"
      aria-describedby="sidus-cookie-body"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl border border-border-strong bg-bg-elevated/95 p-4 shadow-lg backdrop-blur-sm sm:inset-x-auto sm:right-4 sm:bottom-4 sm:left-auto sm:w-[26rem]"
    >
      <p
        id="sidus-cookie-title"
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle"
      >
        {t('cookie.title')}
      </p>
      <p id="sidus-cookie-body" className="mt-2 text-sm leading-relaxed text-muted">
        {t('cookie.body')}{' '}
        <Link
          to="/privacy"
          className="text-signal underline-offset-2 transition-colors hover:text-fg hover:underline"
        >
          {t('cookie.privacy')}
        </Link>
        .
      </p>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => choose('denied')}
          className="h-9 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-fg"
        >
          {t('cookie.reject')}
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className="h-9 bg-accent px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-fg transition-colors hover:bg-fg"
        >
          {t('cookie.accept')}
        </button>
      </div>
    </aside>
  )
}
