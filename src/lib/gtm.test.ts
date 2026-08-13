import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COOKIE_CONSENT_KEY,
  readCookieConsent,
  updateAnalyticsConsent,
  writeCookieConsent,
} from './gtm'

const store = new Map<string, string>()
const localStorageMock = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, v)
  },
  removeItem: (k: string) => {
    store.delete(k)
  },
}

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('window', { dataLayer: undefined as unknown[] | undefined, gtag: undefined })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cookie consent storage', () => {
  it('returns null when unset', () => {
    expect(readCookieConsent()).toBeNull()
  })

  it('round-trips granted and denied', () => {
    writeCookieConsent('granted')
    expect(readCookieConsent()).toBe('granted')
    writeCookieConsent('denied')
    expect(readCookieConsent()).toBe('denied')
    expect(store.get(COOKIE_CONSENT_KEY)).toBe('denied')
  })
})

describe('Consent Mode update', () => {
  it('pushes consent update via gtag arguments', () => {
    const calls: unknown[][] = []
    window.gtag = (...args: unknown[]) => {
      calls.push(args)
    }
    window.dataLayer = []
    updateAnalyticsConsent('granted')
    expect(calls[0]?.[0]).toBe('consent')
    expect(calls[0]?.[1]).toBe('update')
    expect(calls[0]?.[2]).toMatchObject({ analytics_storage: 'granted' })
    expect(window.dataLayer?.some((row) => (row as { event?: string }).event === 'cc_consent_update')).toBe(
      true,
    )
  })
})
