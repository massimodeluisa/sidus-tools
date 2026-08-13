/**
 * Google Tag Manager + Consent Mode v2 helpers.
 * Defaults are set inline in index.html before gtm.js (required).
 */
export const GTM_ID = 'GTM-TP7284WJ'
export const COOKIE_CONSENT_KEY = 'sidus.cookie-consent'
export const COOKIE_CONSENT_REOPEN = 'sidus-open-cookie-consent'

export type TCookieConsent = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** Canonical gtag(): Consent Mode reads the arguments object, not a plain push. */
export function gtag(..._args: unknown[]): void {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(arguments as unknown as Record<string, unknown>)
}

export function readCookieConsent(): TCookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (raw === 'granted' || raw === 'denied') return raw
  } catch {
    /* private mode */
  }
  return null
}

export function writeCookieConsent(choice: TCookieConsent): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice)
  } catch {
    /* ignore */
  }
}

export function updateAnalyticsConsent(choice: TCookieConsent): void {
  const fn = window.gtag ?? gtag
  fn('consent', 'update', {
    analytics_storage: choice,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({
    event: 'cc_consent_update',
    cc_analytics: choice === 'granted',
  })
}

/** SPA page view for GA4 via GTM (maps to page_view when analytics is granted). */
export function trackPageView(path: string): void {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  })
}

export function trackEvent(event: string, payload: Record<string, unknown> = {}): void {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...payload })
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(COOKIE_CONSENT_REOPEN))
}
